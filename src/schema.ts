import { 
  co,
  z,
 
   } from "jazz-tools";

// import { , ,  } from "jazz-tools";
 // type S = (AccountClass<Account> & CoValueFromRaw<Account>) | AnyAccountSchema

export const DesignDoc = co.map({
  html: z.string(),
  createdAt: z.number(),
}).withMigration((doc) => {
  doc.$jazz.owner.makePublic()
});

export const InvoiceList = co.list(DesignDoc);

export const MyAppAccountRoot = co.map({
    invoiceList: InvoiceList
  }) 
// Refer to https://jazz.tools/docs/react/server-side/quickstart
// Essentially  
//
//

export const MyAppAccount = co.account({
  root: MyAppAccountRoot,
  profile: co.profile(),
})
.withMigration((account) => {
  if (!account.$jazz.has("root")) {
    account.$jazz.set("root", {
      invoiceList: InvoiceList.create([], { owner: account }),
    });
    if (account.root.$isLoaded) {
      account.root.$jazz.owner.makePublic();
    }
  }
});

