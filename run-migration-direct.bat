@echo off
echo Running service featured/trending migration...
psql -U postgres -d isafari_db -f backend/migrations/add-service-featured-trending.sql
echo Migration completed!
pause
