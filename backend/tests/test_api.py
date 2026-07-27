def test_meeting_workflow(client):
    response = client.get("/api/meetings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 5
    meeting_id = payload["items"][0]["id"]

    detail = client.get(f"/api/meetings/{meeting_id}")
    assert detail.status_code == 200
    assert detail.json()["transcript_segments"]

    search = client.get("/api/search", params={"query": "migration"})
    assert search.status_code == 200
    assert search.json()

    transcript_search = client.get(
        "/api/transcripts/search/results",
        params={"meeting_id": meeting_id, "keyword": "authentication"},
    )
    assert transcript_search.status_code == 200
    assert transcript_search.json()


def test_action_item_crud_and_exports(client):
    meeting_id = client.get("/api/meetings").json()["items"][0]["id"]
    created = client.post(
        "/api/action-items",
        json={
            "meeting_id": meeting_id,
            "description": "Send follow-up",
            "assignee": "Aryan",
        },
    )
    assert created.status_code == 201
    item_id = created.json()["id"]
    patched = client.patch(f"/api/action-items/{item_id}", json={"completed": True})
    assert patched.json()["completed"] is True

    for suffix, media in (
        ("txt", "text/plain"),
        ("md", "text/markdown"),
        ("pdf", "application/pdf"),
    ):
        export = client.get(f"/api/exports/{suffix}/{meeting_id}")
        assert export.status_code == 200
        assert export.headers["content-type"].startswith(media)


def test_transcript_upload(client):
    meeting_id = client.get("/api/meetings").json()["items"][0]["id"]
    response = client.post(
        f"/api/transcripts/upload?meeting_id={meeting_id}",
        files={
            "file": (
                "sample.txt",
                "Aryan [00:00]\nStart project.\n\nAlex [00:12]\nCan you send notes?",
                "text/plain",
            )
        },
    )
    assert response.status_code == 200
    assert len(response.json()["transcript_segments"]) == 2
