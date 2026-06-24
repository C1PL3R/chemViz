from django.db import models


class Molecule(models.Model):
    name = models.CharField(max_length=100, unique=True)
    format = models.CharField(max_length=10)
    type = models.CharField(max_length=10)
    coordinates = models.TextField()
    is_show = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name