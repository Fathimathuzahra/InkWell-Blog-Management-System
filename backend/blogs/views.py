from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Post, Comment, Like
from .serializers import (
    RegisterSerializer,
    PostSerializer,
    CommentSerializer,
    LikeSerializer,
)
from .permissions import IsOwnerOrReadOnly


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class PostViewSet(viewsets.ModelViewSet):
    queryset = (
        Post.objects
        .select_related("author")
        .prefetch_related("comments__author")
        .annotate(
            total_likes=Count("likes", distinct=True)
        )
    )

    serializer_class = PostSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly
    ]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated]
    )
    def like(self, request, pk=None):
        post = self.get_object()

        like, created = Like.objects.get_or_create(
            post=post,
            user=request.user
        )

        if created:
            message = "Post liked successfully."
        else:
            like.delete()
            message = "Post unliked successfully."

        return Response(
            {
                "message": message,
                "likes_count": post.likes.count(),
                "liked_by_me": post.likes.filter(
                    user=request.user
                ).exists()
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["get", "post"],
        permission_classes=[
            permissions.IsAuthenticatedOrReadOnly
        ]
    )
    def comments(self, request, pk=None):
        post = self.get_object()

        if request.method == "GET":
            comments = post.comments.select_related(
                "author"
            ).all()

            serializer = CommentSerializer(
                comments,
                many=True
            )

            return Response(serializer.data)

        serializer = CommentSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        serializer.save(
            author=request.user,
            post=post
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related(
        "author",
        "post"
    ).all()

    serializer_class = CommentSerializer

    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly
    ]

    def get_queryset(self):
        return Comment.objects.select_related(
            "author",
            "post"
        ).all()

    def perform_create(self, serializer):
        raise PermissionDenied(
            "Create comments through a post's comments endpoint."
        )