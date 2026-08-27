import json
from django.http import JsonResponse
from rest_framework.response import Response
from django.views import View
from view_molecule.models import Molecule 
from .molecule_generator import detect, molecule_generator
from .crystal_generator import generation_of_crystal, get_crystal_id
from .molecule_view import createStructureRecord


class SendNameOfMolecule(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            name = data.get('name')
            
            if not name:
                return JsonResponse({'status': 'fail', 'error': 'Назва молекули не вказана.'}, status=400)

            substance_type, error_msg = detect(name)
            
            if substance_type == "molecule":
                mol_coordinates, gen_error = molecule_generator(name)
                if mol_coordinates:
                    createStructureRecord(coordinates=mol_coordinates, name=name, format="sdf", type="molecule")
                    
                    response = JsonResponse({
                        'status': 'success', 
                        'name': name, 
                        'fileFormat': 'sdf'
                    })
                    
                    response.set_cookie(
                        key='structure',
                        value=str(name).capitalize(),
                        max_age=7 * 24 * 60 * 60,
                        httponly=False,
                        samesite='Lax'
                    )
                    response.set_cookie(
                        key='fileFormat',
                        value="sdf",
                        max_age=7 * 24 * 60 * 60,
                        httponly=False,
                        samesite='Lax'
                    )
                    
                    return response
                else:
                    return JsonResponse({'status': 'fail', 'error': gen_error}, status=422)
            
            return JsonResponse({'status': 'fail', 'error': error_msg}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'fail', 'error': 'Некоректний JSON-запит.'}, status=400)
        except Exception as e:
            return JsonResponse({"status": "fail", "error": f"Внутрішня помилка сервера: {str(e)}"}, status=500)


class SendNameOfCrystal(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            name = data.get('name')

            if not name:
                return JsonResponse({'status': 'fail', 'error': 'Назва кристала не вказана.'}, status=400)

            crystal_id, error = get_crystal_id(name)
            
            if not crystal_id:
                return JsonResponse({'status': 'fail', 'error': error}, status=404)

            mol_coordinates, gen_error = generation_of_crystal(crystal_id)

            if mol_coordinates:
                createStructureRecord(coordinates=mol_coordinates, name=name, format="xyz", type="crystal")

                response = JsonResponse({
                    'status': 'success', 
                    'name': name, 
                    'fileFormat': 'xyz'
                })
                    
                response.set_cookie(
                    key='structure',
                    value=str(name).capitalize(),
                    max_age=7 * 24 * 60 * 60,
                    httponly=False,
                    samesite='Lax'
                )
                response.set_cookie(
                    key='fileFormat',
                    value="xyz",
                    max_age=7 * 24 * 60 * 60,
                    httponly=False,
                    samesite='Lax'
                )
                
                return response
            else:
                return JsonResponse({'status': 'fail', 'error': gen_error}, status=422)
            
        except json.JSONDecodeError:
            return JsonResponse({'status': 'fail', 'error': 'Некоректний JSON-запит.'}, status=400)
        except Exception as e:
            return JsonResponse({"status": "fail", "error": f"Внутрішня помилка сервера: {str(e)}"}, status=500)