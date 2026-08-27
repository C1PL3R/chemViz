from urllib.parse import quote
from requests import get, RequestException
from dataclasses import dataclass

MACROMOLECULE_WEIGHT = 1000
MACROMOLECULE_HEAVY_ATOMS = 200
REQUEST_TIMEOUT = 5

def detect(name: str) -> tuple[str | None, str | None]:
    try:
        mol = get_molecule_data(name)
        mol_type = get_type(mol)
        return mol_type
    except (RequestException, KeyError, IndexError, ValueError) as e:
        return None, f"Сталася помилка: {e}"
    
@dataclass
class MoleculeData:
    weight: float
    heavy_atoms: int
    
def get_molecule_data(name: str) -> MoleculeData:
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{quote(name)}/property/HeavyAtomCount,MolecularWeight/JSON"
    response = get(url, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    
    raw_data = response.json()
    props = raw_data["PropertyTable"]["Properties"][0]

    return MoleculeData(
        weight=float(props.get("MolecularWeight", 0)),
        heavy_atoms=int(props.get("HeavyAtomCount", 0))
    )

def get_type(data: MoleculeData) -> tuple[str | None, str | None]:
    if data.weight >= MACROMOLECULE_WEIGHT or data.heavy_atoms >= MACROMOLECULE_HEAVY_ATOMS:
        return "macro", None
    return "molecule", None
    

def molecule_generator(name):
    sdf_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{quote(name)}/record/SDF/?record_type=3d"
    try:
        response = get(sdf_url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.text, None
    except RequestException as e:
        status = getattr(e.response, 'status_code', None)
        if status == 404:
            return None, "Речовину не знайдено."
        return None, f"Помилка зв'язку: {e}"