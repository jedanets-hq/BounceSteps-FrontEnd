# Quick Test Steps - Add to Cart

## 🚀 Quick Start Testing

### 1. Open Browser Console
```
Press F12 → Click "Console" tab
```

### 2. Login
```
Go to login page
Enter credentials
Look for: ✅ [CartContext] Cart loaded successfully
```

### 3. Go to Service Provider
```
Click on any provider
Look for services loading
```

### 4. Click "Add to Cart"
```
Click "Add to Cart" button
Watch console for logs
```

### 5. Expected Console Output
```
✅ [CartContext] Adding to cart
   Service ID: 47
   Service Title: Test Safari Tour
   User Token: ✅ Present

📡 [API] POST /cart/add - serviceId: 47, quantity: 1

✅ [CartContext] Item added to cart successfully

✅ [CartContext] Cart reloaded. Current items: 1
```

### 6. Verify in UI
```
✅ Service appears in cart sidebar
✅ Cart count shows "1"
✅ Service shows in Cart & Payment page
```

## ❌ If Cart is Still Empty

### Check 1: Is user logged in?
```
Console should show: User Token: ✅ Present
If not: Login first
```

### Check 2: Is backend running?
```
Check if port 5000 is listening
If not: Start backend
```

### Check 3: Is API responding?
```
Look for: 📡 [API] POST /cart/add
If not: Backend may be down
```

### Check 4: Is database saving?
```
Look for: success: true in response
If false: Check database connection
```

### Check 5: Is cart reloading?
```
Look for: 🔄 [CartContext] Reloading cart from database...
If not: Check for errors
```

## 📊 What Each Log Means

| Log | Meaning |
|-----|---------|
| `📤 [CartContext] Adding to cart` | Started add-to-cart process |
| `📡 [API] POST /cart/add` | Sending request to backend |
| `✅ Item added to cart successfully` | Backend saved item |
| `🔄 Reloading cart from database` | Fetching updated cart |
| `✅ Cart reloaded. Current items: 1` | Cart updated in UI |

## 🔧 If Something Goes Wrong

### Error: "Please login to add items to cart"
```
→ User is not authenticated
→ Solution: Login first
```

### Error: "Invalid service - missing ID"
```
→ Service object doesn't have ID
→ Solution: Check service data structure
```

### Error: "Failed to add to cart"
```
→ Backend returned error
→ Solution: Check console for error message
```

### Error: "Cannot connect to backend"
```
→ Backend is not running
→ Solution: Start backend on port 5000
```

## ✅ Success Indicators

- [ ] Console shows all logs without errors
- [ ] Service appears in cart sidebar
- [ ] Cart count increases
- [ ] Service shows in Cart & Payment page
- [ ] Data persists after page reload
- [ ] Can update quantity
- [ ] Can remove item
- [ ] Can proceed to payment

## 🎯 Complete Workflow Test

1. **Login** → See cart load logs
2. **Browse services** → See services load
3. **Add to cart** → See add-to-cart logs
4. **Check sidebar** → Service visible
5. **Go to cart page** → Service visible
6. **Click payment** → Service in modal
7. **Reload page** → Service still there
8. **Update quantity** → Works correctly
9. **Remove item** → Item removed
10. **Clear cart** → Cart empty

## 📞 Need Help?

Check console logs for:
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warnings
- 📡 API calls

All logs are timestamped and detailed.
