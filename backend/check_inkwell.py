import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient

from blogs.models import Post, Comment


def check(condition, message):
    if not condition:
        raise AssertionError(f"FAIL: {message}")

    print(f"PASS: {message}")

def main():
    from django.test import override_settings

    suffix = "terminalcheck"
    usernames = [
        f"inkwell_user_a_{suffix}",
        f"inkwell_user_b_{suffix}",
    ]

    # Avoid overwriting existing accounts.
    if User.objects.filter(username__in=usernames).exists():
        raise RuntimeError(
            "Test accounts already exist. Inspect them before running again."
        )

    user_a = None
    user_b = None

    try:
        # Create test accounts.
        user_a = User.objects.create_user(
            username=usernames[0],
            email=f"{usernames[0]}@example.com",
            password="Demo-Test-Password-847!"
        )

        user_b = User.objects.create_user(
            username=usernames[1],
            email=f"{usernames[1]}@example.com",
            password="Demo-Test-Password-932!"
        )

        post = Post.objects.create(
            author=user_a,
            title="Terminal validation test",
            content="Testing InkWell post permissions."
        )

        comment = Comment.objects.create(
            post=post,
            author=user_a,
            content="Testing comment ownership."
        )

        client_a = APIClient()
        client_b = APIClient()
        anonymous = APIClient()

        # Allow Django's test client hostname for local tests.
        client_a.defaults["HTTP_HOST"] = "localhost"
        client_b.defaults["HTTP_HOST"] = "localhost"
        anonymous.defaults["HTTP_HOST"] = "localhost"

        # Anonymous users should be able to read public posts.
        response = anonymous.get("/api/posts/")
        check(
            response.status_code == 200,
            "Anonymous user can read the posts endpoint"
        )

        # Authenticated user A should be able to create a post.
        client_a.force_authenticate(user=user_a)

        response = client_a.post(
            "/api/posts/",
            {
                "title": "A valid test post",
                "content": "This is valid post content."
            },
            format="json"
        )

        check(
            response.status_code == 201,
            "Authenticated user can create a post"
        )

        # User B must not edit user A's post.
        client_b.force_authenticate(user=user_b)

        response = client_b.patch(
            f"/api/posts/{post.id}/",
            {"title": "Unauthorized change"},
            format="json"
        )

        check(
            response.status_code in (403, 404),
            "Another user cannot edit the owner's post"
        )

        # User B must not delete user A's comment.
        response = client_b.delete(
            f"/api/comments/{comment.id}/"
        )

        check(
            response.status_code in (403, 404),
            "Another user cannot delete the owner's comment"
        )

        # Anonymous users must not create posts.
        response = anonymous.post(
            "/api/posts/",
            {
                "title": "Anonymous post",
                "content": "This should not be created."
            },
            format="json"
        )

        check(
            response.status_code in (401, 403),
            "Anonymous user cannot create a post"
        )

        # Blank post titles must be rejected.
        response = client_a.post(
            "/api/posts/",
            {
                "title": "   ",
                "content": "Content is present."
            },
            format="json"
        )

        check(
            response.status_code == 400,
            "Blank post title is rejected"
        )

        # Blank post content must be rejected.
        response = client_a.post(
            "/api/posts/",
            {
                "title": "A title",
                "content": "   "
            },
            format="json"
        )

        check(
            response.status_code == 400,
            "Blank post content is rejected"
        )

        # Blank comments must be rejected.
        response = client_a.post(
            "/api/comments/",
            {
                "post": post.id,
                "content": "   "
            },
            format="json"
        )

        check(
            response.status_code == 400,
            "Blank comment is rejected"
        )

        print("\nAll checks completed.")

    finally:
        # Delete only the records created for these test accounts.
        # Their posts and comments are deleted through their foreign keys.
        for username in usernames:
            User.objects.filter(username=username).delete()


if __name__ == "__main__":
    main()