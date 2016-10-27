# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

#########################################################################
## This is a sample controller
## - index is the default action of any application
## - user is required for authentication and authorization
## - download is for downloading files uploaded in the db (does streaming)
#########################################################################

PLAID_CLIENT_ID = '<Plaid client ID>'
PLAID_SECRET = '<Plaid secret>'
PLAID_EXCHANGE_URL = 'https://tartan.plaid.com/exchange_token' # Testing only.
STRIPE_API_KEY = '<Stripe API key>' # Use a test key for testing.

def index():
    return dict()

def search():
    ids = Whoosh().search(request.vars.q)
    rows = db(db.doc.id.belongs(ids)).select()
    return response.json(rows)

def plaid_exchange():
    import urllib
    import urllib2
    import json
    from gluon.utils import web2py_uuid

    data = urllib.urlencode(dict(public_token=request.vars.public_token,
                                 account_id=request.vars.account_id,
                                 client_id=PLAID_CLIENT_ID,
                                 secret=PLAID_SECRET))
    exchange = json.loads(urllib2.urlopen(PLAID_EXCHANGE_URL,
                          data=data).read())
    session.payment_tokens = dict(
        stripe_bank_account_token=exchange.get('stripe_bank_account_token'),
        transaction_token=web2py_uuid())

    response.headers['Content-Type'] = 'application/json'
    return json.dumps(dict(institution=request.vars.institution.get('name'),
                           name=request.vars.account.get('name'),
                           transaction_token=session.payment_tokens['transaction_token']))

def payment():
    import stripe
    import json
    from decimal import Decimal

    tokens = session.pop('payment_tokens', None)
    if not tokens or tokens['transaction_token'] != request.vars.transaction_token:
        raise HTTP(401, 'Unauthorized')

    stripe.api_key = STRIPE_API_KEY
    try:
        charge = stripe.Charge.create(
            amount = str(int(Decimal(request.vars.amount) * 100)),
            currency = 'usd',
            source = tokens['stripe_bank_account_token'],
            description = request.vars.description
        )
        status = 'Payment complete'
        #print charge
    except stripe.error.StripeError as e:
        status = 'Payment failed'
        #print e.json_body['error']

    return json.dumps(dict(status=status))

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)



