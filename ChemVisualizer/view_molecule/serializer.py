from rest_framework import serializers
from .models import Molecule

class MoleculeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Molecule
        fields = ["id", "name", "format", "created_at", "coordinates", "type"]
        read_only_fields = ["id"]

class StructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Molecule
        fields = ["id", "name", "format", "created_at", "coordinates", "type"]
        read_only_fields = ["id"]
        