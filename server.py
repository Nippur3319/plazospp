import http.server
import urllib.request
import urllib.parse
import json
import os

PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/feriados':
            # Obtener parámetros de consulta
            query_params = urllib.parse.parse_qs(parsed_url.query)
            anio = query_params.get('anio', [None])[0]
            incluir = query_params.get('incluir', [None])[0]
            
            if not anio:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'El parámetro "anio" es requerido.'}).encode('utf-8'))
                return
            
            api_url = f"https://api.argentinadatos.com/v1/feriados/{anio}"
                
            try:
                print(f"[Python Proxy] Solicitando a URL externa: {api_url}")
                req = urllib.request.Request(
                    api_url, 
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                with urllib.request.urlopen(req) as response:
                    data = response.read()
                    datos_originales = json.loads(data.decode('utf-8'))
                    
                    # Filtrar si no se solicitan opcionales (no_laborable)
                    incluir_opcional = incluir == "opcional"
                    if not incluir_opcional:
                        datos_filtrados = [item for item in datos_originales if item.get('tipo') != 'no_laborable']
                    else:
                        datos_filtrados = datos_originales
                    
                    # Mapear al formato que espera el frontend
                    datos_mapeados = []
                    for item in datos_filtrados:
                        partes = item.get('fecha', '').split('-')
                        if len(partes) == 3:
                            mes_feriado = int(partes[1])
                            dia_feriado = int(partes[2])
                            datos_mapeados.append({
                                'dia': dia_feriado,
                                'mes': mes_feriado,
                                'motivo': item.get('nombre', ''),
                                'tipo': item.get('tipo', ''),
                                'info': 'https://argentinadatos.com',
                                'id': ''.join(c if c.isalnum() else '-' for c in item.get('nombre', '').lower())
                            })
                    
                    mapped_data = json.dumps(datos_mapeados).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET')
                    self.end_headers()
                    self.wfile.write(mapped_data)
            except Exception as e:
                print(f"[Python Proxy] Error o 404 al conectar con la API externa para el año {anio}: {e}. Retornando lista vacía.")
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET')
                self.end_headers()
                self.wfile.write(json.dumps([]).encode('utf-8'))
        else:
            # Servir archivos estáticos convencionales (index.html, main.js, styles.css)
            super().do_GET()

if __name__ == '__main__':
    # Asegurarnos de que servimos desde el directorio donde está este script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, MyHandler)
    print(f"Servidor de desarrollo corriendo en: http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
