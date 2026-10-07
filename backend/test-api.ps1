# ShaadiOS API Test Script
# Tests your deployed backend

param(
    [string]$ApiUrl = "http://localhost:3001"
)

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║     🧪 ShaadiOS API Testing Script                         ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "Testing API at: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Register User
Write-Host "Test 2: Register User" -ForegroundColor Cyan
try {
    $registerBody = @{
        email = "test$(Get-Random)@example.com"
        password = "TestPass@123"
        fullName = "Test User"
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Uri "$ApiUrl/api/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "✅ User registered: $($register.user.email)" -ForegroundColor Green
    $token = $register.token
    Write-Host "   Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Login
Write-Host "Test 3: Login" -ForegroundColor Cyan
try {
    $loginBody = @{
        email = $registerBody | ConvertFrom-Json | Select-Object -ExpandProperty email
        password = "TestPass@123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$ApiUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "✅ Login successful: $($login.user.fullName)" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Get Current User
Write-Host "Test 4: Get Current User" -ForegroundColor Cyan
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $me = Invoke-RestMethod -Uri "$ApiUrl/api/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Current user: $($me.user.fullName)" -ForegroundColor Green
    Write-Host "   Email: $($me.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get user failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Create Wedding
Write-Host "Test 5: Create Wedding" -ForegroundColor Cyan
try {
    $weddingBody = @{
        partner1Name = "Rhea"
        partner2Name = "Arjun"
        couple = "Rhea & Arjun"
        city = "Jaipur"
        date = "2027-02-18T00:00:00.000Z"
        isoDate = "2027-02-18"
        guestCount = 280
        budgetAmount = 2400000
        templateId = "north_indian"
        ceremonies = @("Mehendi", "Haldi", "Sangeet", "Wedding", "Reception")
    } | ConvertTo-Json

    $wedding = Invoke-RestMethod -Uri "$ApiUrl/api/weddings" `
        -Method Post `
        -Body $weddingBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Host "✅ Wedding created: $($wedding.wedding.couple)" -ForegroundColor Green
    Write-Host "   City: $($wedding.wedding.city)" -ForegroundColor Gray
    Write-Host "   Date: $($wedding.wedding.isoDate)" -ForegroundColor Gray
    $weddingId = $wedding.wedding.id
} catch {
    Write-Host "❌ Create wedding failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 6: Create Task
Write-Host "Test 6: Create Task" -ForegroundColor Cyan
try {
    $taskBody = @{
        title = "Book Venue"
        category = "Venue"
        ceremony = "Wedding"
        status = "NOT_STARTED"
        priority = "CRITICAL"
        dependsOn = @()
        blocks = @()
    } | ConvertTo-Json

    $task = Invoke-RestMethod -Uri "$ApiUrl/api/tasks/wedding/$weddingId" `
        -Method Post `
        -Body $taskBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Host "✅ Task created: $($task.task.title)" -ForegroundColor Green
    Write-Host "   Priority: $($task.task.priority)" -ForegroundColor Gray
    $taskId = $task.task.id
} catch {
    Write-Host "❌ Create task failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 7: Complete Task
Write-Host "Test 7: Complete Task" -ForegroundColor Cyan
try {
    $completed = Invoke-RestMethod -Uri "$ApiUrl/api/tasks/$taskId/complete" `
        -Method Post `
        -Headers $headers
    
    Write-Host "✅ Task completed: $($completed.task.title)" -ForegroundColor Green
    Write-Host "   Status: $($completed.task.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Complete task failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host @"

╔════════════════════════════════════════════════════════════╗
║     ✅ All Tests Passed!                                   ║
╚════════════════════════════════════════════════════════════╝

Your API is working correctly!

Next steps:
1. Connect your React frontend to this API
2. Update API_URL in your frontend code
3. Test with real data

"@ -ForegroundColor Green
