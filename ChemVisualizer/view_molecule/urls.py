from django.urls import path, include
from .views_classes.index import Index
from .views_classes.converter_view import ConvertView
from .views_classes.molecule_view import MoleculeView
from rest_framework import routers
from django.conf import settings
from .views import MoluculeAPIView, StructureAPIView
from django.conf.urls.static import static
from .views_classes.visualize_file_view import VisualizeFileView
from .views_classes.send_molecule_data_views import SendNameOfMolecule, SendNameOfCrystal
from .views import about, what_are_smiles, settings_view, terms_of_service, privacy_policy, cookie_policy, disclaimer

router = routers.DefaultRouter()
router.register(r'molecule-history', MoluculeAPIView, basename='molecule-history')
router.register(r'structure', StructureAPIView, basename='structure')


urlpatterns = [
    path('', Index.as_view(), name='index'),
    path('visualizer/', MoleculeView.as_view(), name='visualizer'),
    path('converter/', ConvertView.as_view(), name='converter'),
    path('visualize_file/', VisualizeFileView.as_view(), name='visualize_file'),
    path('about/', about, name='about'),
    path('what_are_smiles/', what_are_smiles, name='what_are_smiles'),
    path('send-name-of-molecule/', SendNameOfMolecule.as_view(), name="send-name-of-molecule"),
    path('send-name-of-crystal/', SendNameOfCrystal.as_view(), name='send-name-of-crystal'),
    path('settings/', settings_view, name='settings'),
    path('terms-of-service/', terms_of_service, name='terms-of-service'),
    path('privacy-policy/', privacy_policy, name='privacy-policy'),
    path('cookie-policy/', cookie_policy, name='cookie-policy'),
    path("disclaimer/", disclaimer, name="disclaimer"),

    path('api/', include(router.urls)),
]

# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)