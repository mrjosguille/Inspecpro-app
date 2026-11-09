from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

# ⚠️ RUTA DE TESSERACT
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app)

@app.route('/procesar-proforma', methods=['POST', 'OPTIONS'])
def procesar_proforma():
    # Manejo de CORS para que el navegador no bloquee
    if request.method == 'OPTIONS':
        return jsonify({"ok": True}), 200

    if 'archivo' not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    
    file = request.files['archivo']
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        file.save(temp.name)
        temp_path = temp.name

    try:
        doc = fitz.open(temp_path)
        texto_completo = ""
        
        # Recorremos cada página
        for page in doc:
            # Bajamos un poco el DPI (200 en lugar de 300) para que no consuma tanta memoria
            pix = page.get_pixmap(dpi=200) 
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Le pasamos la imagen a Tesseract
            texto_pagina = pytesseract.image_to_string(img, lang='spa')
            texto_completo += texto_pagina + "\n"
        
        doc.close()
        return jsonify({"texto": texto_completo})

    except Exception as e:
        print(f"ERROR DETALLADO: {str(e)}") # Para ver el error en la terminal
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

if __name__ == '__main__':
    app.run(port=5000, debug=True)