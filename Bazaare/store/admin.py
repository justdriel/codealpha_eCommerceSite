# store/admin.py
from django.contrib import admin
from .models import Product, Cart, CartItem, Order, OrderItem

# Register the main models
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Cart)

# Optional: You can create model admins to display more details
# class OrderItemInline(admin.TabularInline):
#     model = OrderItem
#     raw_id_fields = ['product']

# class OrderAdmin(admin.ModelAdmin):
#     list_display = ['id', 'user', 'total_amount', 'status', 'created_at']
#     list_filter = ['status', 'created_at']
#     inlines = [OrderItemInline]
# 
# admin.site.register(Order, OrderAdmin)