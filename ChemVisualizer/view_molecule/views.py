from django.shortcuts import render
from .serializer import MoleculeSerializer, StructureSerializer
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import viewsets, mixins
from django.db.models.functions import Random
from .models import Molecule
from django.http import HttpResponse

def about(request):
    return render(request, 'about.html', {'title': 'ChemViz'})


def what_are_smiles(request):
    return render(request, 'what_are_smiles.html', {'title': "ChemViz"})

def settings_view(request):
    return render(request, 'settings.html', {'title': "ChemViz"})

def terms_of_service(request):
    return render(request, 'Policies/terms_of_service.html', {'title': "ChemViz"})

def privacy_policy(request):
    return render(request, 'Policies/privacy_policy.html', {'title': "ChemViz"})

def cookie_policy(request):
    return render(request, 'Policies/cookie_policy.html', {'title': "ChemViz"})

def disclaimer(request):
    return render(request, 'Policies/disclaimer.html', {'title': "ChemViz"})

class MoleculePagination(LimitOffsetPagination):
    default_limit = 24
    max_limit = 100


class MoluculeAPIView(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = MoleculeSerializer
    pagination_class = MoleculePagination

    def get_queryset(self):
        return Molecule.objects.filter(is_show=True).annotate(rand_order=Random()).order_by('rand_order')
    
class StructureAPIView(viewsets.ReadOnlyModelViewSet):
    serializer_class = StructureSerializer

    def get_queryset(self):
        name = self.request.query_params.get('name', None)
        
        if name is not None:
            return Molecule.objects.filter(name__iexact=name)
        return Molecule.objects.all()