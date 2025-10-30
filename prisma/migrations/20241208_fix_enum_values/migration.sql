-- Fix enum values to use lowercase
-- This migration updates all enum values to use lowercase consistently

-- Update UserRole enum values
UPDATE "User" SET role = 'admin' WHERE role = 'ADMIN';
UPDATE "User" SET role = 'judge' WHERE role = 'JUDGE';
UPDATE "User" SET role = 'participant' WHERE role = 'PARTICIPANT';

-- Update HackathonStatus enum values
UPDATE "Hackathon" SET status = 'draft' WHERE status = 'DRAFT';
UPDATE "Hackathon" SET status = 'open' WHERE status = 'OPEN';
UPDATE "Hackathon" SET status = 'closed' WHERE status = 'CLOSED';
UPDATE "Hackathon" SET status = 'completed' WHERE status = 'COMPLETED';

-- Update ParticipantStatus enum values
UPDATE "Participant" SET status = 'pending' WHERE status = 'PENDING';
UPDATE "Participant" SET status = 'approved' WHERE status = 'APPROVED';
UPDATE "Participant" SET status = 'rejected' WHERE status = 'REJECTED';

-- Update TeamType enum values
UPDATE "Participant" SET "teamType" = 'individual' WHERE "teamType" = 'INDIVIDUAL';
UPDATE "Participant" SET "teamType" = 'team' WHERE "teamType" = 'TEAM';
