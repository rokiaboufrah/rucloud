from django.core.management import call_command
from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Load the safe catalog fixture once, only when the product table is empty.'

    def handle(self, *args, **options):
        if Product.objects.exists():
            self.stdout.write('Products already exist; skipping catalog load.')
            return

        call_command('loaddata', 'catalog', verbosity=options.get('verbosity', 1))
        self.stdout.write(self.style.SUCCESS(
            f'Catalog loaded: {Product.objects.count()} products, '
            f'{Product.objects.filter(sizes__isnull=False).distinct().count()} products with sizes.'
        ))
