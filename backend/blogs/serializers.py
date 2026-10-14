from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import Post, Comment, Like


# =====================================================
# USER SERIALIZER
# =====================================================

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email"]


# =====================================================
# REGISTRATION SERIALIZER
# =====================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"}
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password"
        ]

        read_only_fields = ["id"]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError(
                "Email address is required."
            )

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):

        # Create the account as inactive.
        # The user must verify their email before logging in.
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=False
        )

        return user


# =====================================================
# COMMENT SERIALIZER
# =====================================================

class CommentSerializer(serializers.ModelSerializer):

    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment

        fields = [
            "id",
            "post",
            "author",
            "content",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "post",
            "author",
            "created_at",
            "updated_at"
        ]

    def validate_content(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )

        return value


# =====================================================
# LIKE SERIALIZER
# =====================================================

class LikeSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = Like

        fields = [
            "id",
            "post",
            "user",
            "created_at"
        ]

        read_only_fields = [
            "id",
            "post",
            "user",
            "created_at"
        ]


# =====================================================
# POST SERIALIZER
# =====================================================

class PostSerializer(serializers.ModelSerializer):

    author = UserSerializer(read_only=True)

    comments = CommentSerializer(
        many=True,
        read_only=True
    )

    comments_count = serializers.IntegerField(
        source="comments.count",
        read_only=True
    )

    likes_count = serializers.IntegerField(
        source="likes.count",
        read_only=True
    )

    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Post

        fields = [
            "id",
            "title",
            "content",
            "author",
            "comments",
            "comments_count",
            "likes_count",
            "liked_by_me",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "author",
            "comments",
            "comments_count",
            "likes_count",
            "liked_by_me",
            "created_at",
            "updated_at"
        ]

    def get_liked_by_me(self, obj):

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            return obj.likes.filter(
                user=request.user
            ).exists()

        return False

    def validate_title(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return value

    def validate_content(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Post content cannot be empty."
            )

        return value