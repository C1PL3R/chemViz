from urllib.parse import quote
from requests import get, RequestException

REQUEST_TIMEOUT = 5

def detect_substance_type(name):
    clean_name = name.strip().lower()
    encoded_name = quote(clean_name)
    
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{encoded_name}/property/HeavyAtomCount,MolecularWeight/JSON"
    
    try:
        response = get(url, timeout=REQUEST_TIMEOUT)
        if response.status_code != 200:
            return "unknown", f"Речовину '{name}' не знайдено на PubChem."
            
        data = response.json()
        properties_list = data.get("PropertyTable", {}).get("Properties", [])
        
        if not properties_list:
            return "unknown", f"Не вдалося отримати властивості для '{name}'."
            
        properties = properties_list[0]
        weight = float(properties.get("MolecularWeight", 0))
        heavy_atoms = int(properties.get("HeavyAtomCount", 0))
        
        if weight >= 1000 or heavy_atoms >= 200:
            return "macro", "Це гігантська макромолекула (білок/полімер)."

        return "molecule", None

    except RequestException as e:
        return "unknown", f"Помилка зв'язку з сервером PubChem: {str(e)}"
    except (ValueError, KeyError, IndexError):
        return "unknown", "Помилка обробки даних від PubChem."


def molecule_generator(name):
    clean_name = name.strip().lower()
    encoded_name = quote(clean_name)
    
    sdf_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{encoded_name}/record/SDF/?record_type=3d"
    
    try:
        response = get(sdf_url, timeout=REQUEST_TIMEOUT)
        if response.status_code == 200:
            return response.text, None
        return None, "Для цієї речовини не знайдено 3D-координат."
    except RequestException:
        return None, "Не вдалося завантажити геометрію молекули."