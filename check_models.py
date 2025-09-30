import google.generativeai as genai

# --- PASTE YOUR NEW, SECRET API KEY HERE ---
API_KEY = 'AIzaSyBqY0OEEhTsVGD6H_nSfET-vMu4C4Q4koE'

genai.configure(api_key=API_KEY)

print("Available models:")
for m in genai.list_models():
  # Check if the model supports the 'generateContent' method
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)