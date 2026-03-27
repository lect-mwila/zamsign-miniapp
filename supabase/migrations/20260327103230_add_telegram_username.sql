ALTER TABLE public.users ADD COLUMN telegram_username TEXT;

-- Update the handle_new_user function to also insert the telegram_username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, telegram_id, first_name, last_name, telegram_username)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'telegram_id')::BIGINT,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'telegram_username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
