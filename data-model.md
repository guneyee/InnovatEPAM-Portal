# Data Model - InnovatEPAM Portal

## Entities
1. User
2. Idea
3. Attachment
4. ReviewEvent

## Users
1. id
2. email
3. password_hash
4. role
5. created_at
6. updated_at

## Ideas
1. id
2. user_id
3. title
4. description
5. category
6. status
7. created_at
8. updated_at

## Attachments
1. id
2. idea_id
3. filename
4. mime_type
5. size_bytes
6. storage_path
7. uploaded_at

## Review Events
1. id
2. idea_id
3. admin_id
4. previous_status
5. new_status
6. comment
7. created_at

## Relationships
1. User has many Ideas.
2. Idea has many Attachments or one Attachment in MVP.
3. Idea has many ReviewEvents.

## State Rules
1. New ideas start as submitted.
2. Admin updates can move an idea to under review, accepted, or rejected.
3. Review events must preserve history.
