@echo off
start /B ssh -N -L 5433:localhost:5432 zenith
ping 127.0.0.1 -n 5 >nul
npx -y @modelcontextprotocol/server-postgres postgresql://zenith_bot:zenith6Z%%40@localhost:5433/zenith_data
