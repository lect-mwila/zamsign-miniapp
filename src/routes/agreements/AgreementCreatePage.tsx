
import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from  '@/components/SignatureCanvas'


type Step = 1 | 2 | 3 | 4 | 5;

export default function AgreementCreatePage() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    seller: { name: '', nrc: '', address: '', username: '' },
    buyer: { name: '', nrc: '', address: '', username: '' },
    witness: { name: '', nrc: '', address: '' },
  });
  const currentRole = "seller"
  const [sellerSig, setSellerSig] = useState<string | null>(null);
  const [buyerSig, setBuyerSig] = useState<string | null>(null);
  const [witnessSig, setWitnessSig] = useState<string | null>(null);

  const sellerCanvasRef = useRef<HTMLCanvasElement>(null);
  const buyerCanvasRef = useRef<HTMLCanvasElement>(null);
  const witnessCanvasRef = useRef<HTMLCanvasElement>(null);

  const progress = ((step - 1) / 4) * 100;

  // Navigation
  const nextStep = () => {
    if (step < 5) setStep((s) => (s + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  // Simple form handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.') as ['seller' | 'buyer' | 'witness', string];
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Canvas Signature Logic (simplified - can be extracted to a custom hook)
  const initCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, role: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1A4F9C';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';


    // Add drawing logic here (mousedown, touch events, etc.)
    // I'll provide a full reusable SignatureCanvas component if you want
  };

  const saveSignature = (role: 'seller' | 'buyer' | 'witness') => {
    const refs = {
      seller: sellerCanvasRef,
      buyer: buyerCanvasRef,
      witness: witnessCanvasRef,
    };
    const canvas = refs[role].current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    
    if (role === 'seller') setSellerSig(dataUrl);
    else if (role === 'buyer') setBuyerSig(dataUrl);
    else setWitnessSig(dataUrl);
  };

  const clearSignature = (role: 'seller' | 'buyer' | 'witness') => {
    const refs = { seller: sellerCanvasRef, buyer: buyerCanvasRef, witness: witnessCanvasRef };
    const canvas = refs[role].current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    
    if (role === 'seller') setSellerSig(null);
    else if (role === 'buyer') setBuyerSig(null);
    else setWitnessSig(null);
  };

  const finalizeAgreement = () => {
    // Save agreement logic here
    console.log('Finalizing agreement with signatures:', { sellerSig, buyerSig, witnessSig });
    // Navigate back to agreements list or view the new agreement
  };

  return (
    <div className="screen active">
      <div className="header">
        <button onClick={() => window.history.back()} className="back-btn">←</button>
        <div>
          <div className="logo-text" style={{ fontSize: '17px' }}>Create Agreement</div>
          <div className="tagline">Step {step} of 5</div>
        </div>
      </div>

      <div className="content-area">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* STEP 1: Agreement Details */}
        {step === 1 && (
          <div>
            <div className="card">
              <div className="section-title">📄 Agreement Details</div>
              <div className="form-group">
                <label>Agreement Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Sale of Motor Vehicle" />
              </div>
              <div className="form-group">
                <label>Amount (ZMW) *</label>
                <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="e.g. 15000" />
              </div>
              <div className="form-group">
                <label>Description / Conditions *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the item(s) and conditions..." />
              </div>
            </div>
            <button className="btn-primary" onClick={nextStep}>Continue →</button>
          </div>
        )}

        {/* STEP 2: Seller Details */}
        {step === 2 && (
          <div>
            <div className="card">
              <div className="section-title">👤 Seller / Initiator Details</div>
              {['name', 'nrc', 'address', 'username'].map(field => (
                <div className="form-group" key={field}>
                  <label>{field === 'username' ? 'Telegram Username *' : field.replace(/^\w/, c => c.toUpperCase())} *</label>
                  <input 
                    name={`seller.${field}`} 
                    value={formData.seller[field as keyof typeof formData.seller]} 
                    onChange={handleChange} 
                    placeholder={`Enter ${field}`} 
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-outline" onClick={prevStep}>← Back</button>
              <button className="btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Buyer + Witness */}
        {step === 3 && (
          <div>
            {/* Buyer Card + Witness Card - similar structure */}
            {/* ... I'll keep it short for now, but same pattern */}
            <div className="flex gap-3">
              <button className="btn-outline" onClick={prevStep}>← Back</button>
              <button className="btn-primary" onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Seller Signature */}
        {step === 4 && (
          <div>
            <div className="card">
              <div className="section-title">✍️ Seller Signature</div>
				<SignatureCanvas
				  onSave={(dataUrl) => {
					if (currentRole === 'seller') setSellerSig(dataUrl);
					else if (currentRole === 'buyer') setBuyerSig(dataUrl);
					else setWitnessSig(dataUrl);
				  }}
				  onClear={() => {
					if (currentRole === 'seller') setSellerSig(null);
					// ... etc
				  }}
				  height={180}
				/>
              {sellerSig && <img src={sellerSig} alt="Seller signature" className="sig-img" />}
            </div>
            <div className="flex gap-3">
              <button className="btn-outline" onClick={prevStep}>← Back</button>
              <button className="btn-primary" onClick={nextStep} disabled={!sellerSig}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 5: Buyer & Witness Signature + Finalize */}
        {step === 5 && (
          <div>
            {/* Buyer Signature + Witness (conditional) */}
            <button className="btn-secondary" onClick={finalizeAgreement} disabled={!buyerSig}>
              🔒 Finalize Agreement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}