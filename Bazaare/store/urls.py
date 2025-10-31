# store/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView

# Use a router for the Product API
router = DefaultRouter()
router.register(r'api/products', views.ProductViewSet)

urlpatterns = [
    
    path('', views.IndexView.as_view(), name='index'), 
    path('shop/', views.ShopView.as_view(), name='shop'),
    path('about/', TemplateView.as_view(template_name='about.html'), name='about'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('cart/', TemplateView.as_view(template_name='cart.html'), name='cart'),
    path('checkout/', TemplateView.as_view(template_name='checkout.html'), name='checkout'),
    
    
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
    path('register/', views.register_view, name='register'),
    
    \
    path('', include(router.urls)),
    path('api/cart/', views.cart_detail, name='api_cart_detail'),
    path('api/cart/add/', views.add_to_cart, name='api_add_to_cart'),
    path('api/order/process/', views.process_order, name='api_process_order'),
]