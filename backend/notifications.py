"""Fail-safe, plain-text notification helpers.

Every helper swallows and logs errors so that sending an email can never break
an order, signup, or password reset request.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _from_email():
    return getattr(settings, 'DEFAULT_FROM_EMAIL', 'webmaster@localhost')


def _admin_email():
    return (getattr(settings, 'ADMIN_EMAIL', '') or '').strip()


def _frontend_url():
    return (getattr(settings, 'FRONTEND_URL', '') or 'https://rucloud.vercel.app').rstrip('/')


def _send(subject, body, recipients):
    recipients = [address.strip() for address in recipients if address and address.strip()]
    if not recipients:
        return
    try:
        send_mail(subject, body, _from_email(), recipients, fail_silently=False)
    except Exception:
        logger.exception('Failed to send email: %s', subject)


def _order_lines(order):
    lines = []
    for item in order.items.all():
        size = f' ({item.size})' if item.size else ''
        lines.append(f'- {item.product_name}{size} x{item.quantity} - {item.price} each = {item.subtotal}')
    return '\n'.join(lines) if lines else '- (no items)'


def send_order_confirmation(order):
    try:
        body = (
            f'Hi {order.full_name},\n\n'
            f'Thank you for your order #{order.id}.\n\n'
            f'Items:\n{_order_lines(order)}\n\n'
            f'Total: {order.total}\n'
            f'Payment method: {order.payment_method}\n'
            f'Delivery to: {order.address}, {order.city}, {order.country}\n\n'
            'We will contact you when your order is on its way.'
        )
        _send(f'Order #{order.id} confirmation', body, [order.email])
    except Exception:
        logger.exception('Failed to build order confirmation for order %s', order.id)


def send_new_order_alert(order):
    admin_email = _admin_email()
    if not admin_email:
        return
    try:
        body = (
            f'New order #{order.id} from {order.full_name} ({order.email}, {order.phone}).\n\n'
            f'Items:\n{_order_lines(order)}\n\n'
            f'Total: {order.total}\n'
            f'Payment method: {order.payment_method}\n'
            f'Delivery to: {order.address}, {order.city}, {order.country}\n'
            f'Notes: {order.notes or "-"}'
        )
        _send(f'New order #{order.id}', body, [admin_email])
    except Exception:
        logger.exception('Failed to build new order alert for order %s', order.id)


def send_contact_alert(message):
    admin_email = _admin_email()
    if not admin_email:
        return
    try:
        body = (
            f'New contact message #{message.id}\n'
            f'From: {message.name} <{message.email}>\n'
            f'Subject: {message.subject or "(no subject)"}\n\n'
            f'{message.message}'
        )
        _send(f'New contact message: {message.subject or "(no subject)"}', body, [admin_email])
    except Exception:
        logger.exception('Failed to build contact alert for message %s', getattr(message, 'id', '?'))


def send_newsletter_welcome(subscriber):
    try:
        body = (
            'Welcome to Ru Cloud!\n\n'
            'Thanks for subscribing. You will hear about new collections and offers first.'
        )
        _send('Welcome to Ru Cloud', body, [subscriber.email])
    except Exception:
        logger.exception('Failed to build newsletter welcome for %s', getattr(subscriber, 'email', '?'))


def send_password_reset_email(user, uid, token):
    try:
        link = f'{_frontend_url()}/reset-password/{uid}/{token}'
        body = (
            f'Hi {user.username},\n\n'
            'You requested a password reset for your Ru Cloud account.\n\n'
            f'Use this link to choose a new password:\n{link}\n\n'
            'If you did not request this, you can safely ignore this email.'
        )
        _send('Reset your Ru Cloud password', body, [user.email])
    except Exception:
        logger.exception('Failed to build password reset email for %s', getattr(user, 'username', '?'))
