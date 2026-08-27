import requests
from pymatgen.io.cif import CifParser
from pymatgen.core.structure import IMolecule
import pymysql


def get_crystal_id(crystal_name):
    try:
        connection = pymysql.connect(
            host='www.crystallography.net',
            user='cod_reader',
            password='',
            database='cod',
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            sql = "SELECT file, formula, mineral FROM data WHERE mineral LIKE %s LIMIT 5"
            cursor.execute(sql, (f"%{crystal_name}%",))
            
            results = cursor.fetchall()
            
            if not results:
                return None, f"Кристал '{crystal_name}' не знайдено."
            
            best_match = results[0] 
            
            cod_id = best_match[0]
            # formula = best_match[1]
            # mineral_name = best_match[2]
            
            # print(f" Знайдено найкращий збіг:")
            # print(f"ID: {cod_id} | Формула: {formula} | Назва: {mineral_name}")
            
            return cod_id, None
                
    except Exception as e:
        return None, f"Помилка підключення до MySQL: {e}"
    finally:
        if 'connection' in locals():
            connection.close()


def generation_of_crystal(crystal_id):
    cod_url = f"https://www.crystallography.net/cod/{crystal_id}.cif"

    try:
        response = requests.get(cod_url, timeout=10)
        if response.status_code == 200:
            parser = CifParser.from_str(response.text)
            structures = parser.parse_structures(primitive=True)
            structure = structures[0]

            for site in structure:
                if isinstance(site.species, dict) or hasattr(
                    site.species, "items"
                ):
                    most_probable_element = list(site.species.keys())[0]
                    site.species = most_probable_element

            structure.make_supercell([5, 5, 5])
            mol = IMolecule.from_sites(structure.sites)
            expanded_xyz_text = mol.to(fmt="xyz")

            return expanded_xyz_text, None
        else:
            return None, f"Помилка завантаження. Код: {response.status_code}"
    except requests.RequestException:
        return None, "База даних недоступна."
    except Exception as e:
        return None, f"Помилка обробки CIF: {str(e)}"
