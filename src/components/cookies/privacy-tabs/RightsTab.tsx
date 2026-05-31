import { ExternalLink } from 'lucide-react';

interface RightsTabProps {
  t: (key: string) => string;
  contactEmail: string;
}

export function RightsTab({ t, contactEmail }: RightsTabProps) {
  return (
    <div id="panel-rights" role="tabpanel" className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('privacy.rights.title')}</h3>

        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('privacy.rights.access.title')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('privacy.rights.access.description')}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('privacy.rights.rectification.title')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('privacy.rights.rectification.description')}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('privacy.rights.erasure.title')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('privacy.rights.erasure.description')}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('privacy.rights.portability.title')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('privacy.rights.portability.description')}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{t('privacy.rights.objection.title')}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('privacy.rights.objection.description')}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">{t('privacy.rights.contact.title')}</h4>
                <p className="text-sm text-blue-700 mb-3">
                  {t('privacy.rights.contact.description')}
                </p>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    <span>{contactEmail}</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
