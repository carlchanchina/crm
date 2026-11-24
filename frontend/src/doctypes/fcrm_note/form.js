// Routes that actually exist in the CRM front-end. A reference type that is
// missing here (e.g. 'CRM Organization' used to fall through to 'Lead') must
// not be guessed: the note/task then simply offers no "Open" action.
const REFERENCE_ROUTES = {
  'CRM Deal': { name: 'Deal', param: 'dealId' },
  'CRM Lead': { name: 'Lead', param: 'leadId' },
  'CRM Organization': { name: 'Organization', param: 'organizationId' },
  'CRM Contact': { name: 'Contact', param: 'contactId' },
}

export class FCRMNote {
  onRender() {
    if (!this.doc.reference_doctype || !this.doc.reference_docname) return

    const route = REFERENCE_ROUTES[this.doc.reference_doctype]
    if (!route) return

    this.actions = [
      {
        name: 'Redirect Action',
        label: __('Open {0}', [
          __(this.doc.reference_doctype.replace('CRM ', '')),
        ]),
        onClick: (close) => {
          const params = {}
          params[route.param] = this.doc.reference_docname
          this.router.push({ name: route.name, params })
          close?.()
        },
      },
    ]
  }
}
