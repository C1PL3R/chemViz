# from django.shortcuts import render, redirect
from django.views import View
from django.http import HttpResponse, JsonResponse
# from django.utils.datastructures import MultiValueDictKeyError

class VisualizeFileView(View):
    def get(self, request):
        return JsonResponse({
            'status': 'temporary_unavailable',
            'message': 'Ця вкладка тимчасово недоступна!'
        }, status=503)

# class VisualizeFileView(View):
#     def get(self, request):
#         sdf_data = request.session.pop("sdf_file", None)
#         sdf_filename = request.session.pop("sdf_filename", "Файлу немає :(")
#         return render(
#             request,
#             "ChemVisualizer/visualize.html",
#             {
#                 "sdf_data": sdf_data,
#                 "title": "ChemViz",
#                 "sdf_filename": sdf_filename,
#             },
#         )

#     def post(self, request):
#         try:
#             sdf_file = request.FILES["sdf_file"]
#             sdf_data = sdf_file.read().decode("utf-8")

#             request.session["sdf_file"] = sdf_data
#             request.session["sdf_filename"] = sdf_file.name

#             return redirect("visualize_file")
#         except MultiValueDictKeyError:
#             return HttpResponse("❌ Файл не надано.", status=400)

