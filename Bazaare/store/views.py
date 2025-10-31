
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.views.generic import DetailView, ListView, TemplateView


from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from .models import Product, Cart, CartItem, Order
from .serializers import ProductSerializer, CartSerializer
from .forms import CustomUserCreationForm


def get_cart_from_request(request):
    if request.user.is_authenticated:
        
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart



class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['featured_products'] = Product.objects.filter(is_featured=True)[:3]
        return context

class ShopView(ListView):
    model = Product
    template_name = 'shop.html'
    context_object_name = 'products'
    paginate_by = 9 
class ProductDetailView(DetailView):
    model = Product
    template_name = 'product_detail.html'
    context_object_name = 'product'
    slug_url_kwarg = 'slug'


def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index') 
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})




class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

@api_view(['GET'])
def cart_detail(request):
    cart = get_cart_from_request(request)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
    product_slug = request.data.get('product_slug')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(slug=product_slug)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    cart = get_cart_from_request(request)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, 
        product=product, 
        defaults={'quantity': quantity}
    )
    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    return Response(CartSerializer(cart, context={'request': request}).data, status=status.HTTP_200_OK)

@api_view(['POST'])
@login_required 
def process_order(request):
    cart = get_cart_from_request(request)
    if not cart.items.exists():
        return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    
   
    order = Order.objects.create(
        user=request.user,
        total_amount=cart.total_price,
        full_name=data.get('full_name'),
        email=data.get('email'),
        address=data.get('address'),
        status='Processing'
    )
    
    
    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product_name=item.product.name,
            price=item.product.price,
            quantity=item.quantity
        )
    
    
    cart.items.all().delete()
    
    return Response({"message": "Order placed successfully!", "order_id": order.id}, status=status.HTTP_201_CREATED)


