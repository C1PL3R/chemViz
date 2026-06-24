from django.shortcuts import render, redirect
from django.views import View
from view_molecule.models import Molecule


class MoleculeView(View):
    def get(self, request):
        context = {
            "title": "ChemViz",
        }

        response = render(request, "ChemVisualizer/molecule_view.html", context)
        return response


def createStructureRecord(name, coordinates, format, type):
    Molecule.objects.get_or_create(
        name=str(name).capitalize, defaults={"coordinates": coordinates, "format": format, "type": type}
    )
