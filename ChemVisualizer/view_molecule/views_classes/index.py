from django.shortcuts import render
from django.views import View
from view_molecule.models import Molecule


class Index(View):
    def get(self, request):
        molecules = Molecule.objects.all().filter(is_show=True)
        context = {
            "title": "ChemViz",
            'molecules_history': molecules,
        }
        return render(request, 'index.html', context)