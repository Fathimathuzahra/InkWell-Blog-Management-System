from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, PostViewSet, CommentViewSet

router = DefaultRouter()
router.register("posts", PostViewSet, basename="post")
router.register("comments", CommentViewSet, basename="comment")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]
