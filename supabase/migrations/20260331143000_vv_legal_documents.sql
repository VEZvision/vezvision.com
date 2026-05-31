CREATE TABLE IF NOT EXISTS public.vv_legal_documents (
  document_key   TEXT PRIMARY KEY,
  title_pl       TEXT NOT NULL,
  title_en       TEXT NOT NULL,
  content_pl     TEXT NOT NULL,
  content_en     TEXT NOT NULL,
  version        TEXT NOT NULL DEFAULT '1.0',
  last_updated   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published   BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vv_legal_documents_updated_at
  BEFORE UPDATE ON public.vv_legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.vv_set_updated_at();

ALTER TABLE public.vv_legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vv_legal_documents_public_read" ON public.vv_legal_documents
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "vv_legal_documents_admin_all" ON public.vv_legal_documents
  FOR ALL TO authenticated
  USING (vv_is_admin())
  WITH CHECK (vv_is_admin());

GRANT SELECT ON public.vv_legal_documents TO anon;

INSERT INTO public.vv_legal_documents (
  document_key,
  title_pl,
  title_en,
  content_pl,
  content_en,
  version,
  last_updated,
  is_published
)
VALUES
  (
    'privacy_policy',
    'Polityka Prywatności',
    'Privacy Policy',
    $$# Polityka Prywatności VezVision

## 1. Postanowienia Ogólne
Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem z serwisu internetowego **VezVision** dostępnego pod adresem vezvision.com (dalej "Serwis").

## 2. Administrator Danych
Administratorem danych osobowych zawartych w serwisie jest **POLIFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ** z siedzibą w Bielsko-Białej, przy Złote Łany 11, 43-300 Bielsko-Biała, KRS: 0000831630, NIP: 5472217672, REGON: 385670222 (dalej "Administrator").

Możesz skontaktować się z Administratorem pisząc na adres e-mail: **privacy@vezvision.com** lub listownie na adres siedziby.

## 3. Bezpieczeństwo Danych
W trosce o bezpieczeństwo powierzonych nam danych opracowaliśmy wewnętrzne procedury i zalecenia, które mają zapobiec udostępnieniu danych osobom nieupoważnionym. Kontrolujemy ich wykonywanie i stale sprawdzamy ich zgodność z odpowiednimi aktami prawnymi - ustawą o ochronie danych osobowych, ustawą o świadczeniu usług drogą elektroniczną, a także wszelkiego rodzaju aktach wykonawczych i aktach prawa wspólnotowego (RODO).

## 4. Cel i Podstawa Przetwarzania Danych
Dane Osobowe przetwarzane są na podstawie zgody wyrażanej przez Użytkownika oraz w przypadkach, w których przepisy prawa upoważniają Administratora do przetwarzania danych osobowych na podstawie przepisów prawa lub w celu realizacji zawartej pomiędzy stronami umowy.

Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniach w następujący sposób:
1. Poprzez dobrowolnie wprowadzone w formularzach informacje (np. formularz kontaktowy, zapis na newsletter).
2. Poprzez gromadzenie plików "cookies" [patrz Polityka Plików Cookies].

Dane podane w formularzu są przetwarzane w celu wynikającym z funkcji konkretnego formularza, np. w celu dokonania procesu obsługi zgłoszenia kontaktowego lub prezentacji oferty handlowej.

## 5. Prawa Użytkownika
Zgodnie z RODO, przysługują Ci następujące prawa:
* Prawo dostępu do swoich danych oraz otrzymania ich kopii.
* Prawo do sprostowania (poprawiania) swoich danych.
* Prawo do usunięcia danych (prawo do bycia zapomnianym).
* Prawo do ograniczenia przetwarzania danych.
* Prawo do wniesienia sprzeciwu wobec przetwarzania danych.
* Prawo do przenoszenia danych.
* Prawo do wniesienia skargi do organu nadzorczego (Prezesa Urzędu Ochrony Danych Osobowych).

## 6. Udostępnianie Danych
Dane osobowe pozostawione w serwisie nie zostaną sprzedane ani udostępnione osobom trzecim, zgodnie z przepisami Ustawy o ochronie danych osobowych, z wyjątkiem podmiotów współpracujących z Administratorem w zakresie niezbędnym do realizacji usług (np. dostawcy hostingu, systemy mailingowe, obsługa księgowa).

## 7. Zmiany w Polityce Prywatności
Zastrzegamy sobie prawo do zmiany w polityce ochrony prywatności serwisu, na które może wpłynąć rozwój technologii internetowej, ewentualne zmiany prawa w zakresie ochrony danych osobowych oraz rozwój naszego serwisu internetowego. O wszelkich zmianach będziemy informować w sposób widoczny i zrozumiały.

## 8. Kontakt
W razie wątpliwości co do któregokolwiek z zapisów niniejszej polityki prywatności jesteśmy do dyspozycji - nasze dane znaleźć można w zakładce lub stopce - KONTAKT.$$,
    $$# Privacy Policy of VezVision

## 1. General Provisions
This Privacy Policy sets out the rules for the processing and protection of personal data provided by Users in connection with the use of the **VezVision** website available at vezvision.com (hereinafter the "Website").

## 2. Data Controller
The administrator of personal data contained in the website is **POLIFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ** with its registered office in Bielsko-Biała, at Złote Łany 11, 43-300 Bielsko-Biała, KRS: 0000831630, NIP: 5472217672, REGON: 385670222 (hereinafter the "Administrator").

You can contact the Administrator by writing to the e-mail address: **privacy@vezvision.com** or by post to the registered office address.

## 3. Data Security
Out of concern for the security of the data entrusted to us, we have developed internal procedures and recommendations to prevent data from being made available to unauthorized persons. We control their implementation and constantly check their compliance with relevant legal act - the Personal Data Protection Act, the Act on Providing Electronic Services, as well as all kinds of executive acts and Community law (GDPR).

## 4. Purpose and Basis of Data Processing
Personal Data is processed based on the consent expressed by the User and in cases where the law authorizes the Administrator to process personal data based on legal provisions or to implement the agreement concluded between the parties.

The Website performs the functions of obtaining information about users and their behavior in the following way:
1. Through information voluntarily entered in forms (e.g. contact form, newsletter subscription).
2. Through the collection of "cookies" [see Cookie Policy].

The data provided in the form is processed for the purpose resulting from the function of a specific form, e.g. to process a contact request or present a commercial offer.

## 5. User Rights
In accordance with the GDPR, you have the following rights:
* The right to access your data and receive a copy of it.
* The right to rectify (correct) your data.
* The right to delete data (the right to be forgotten).
* The right to restrict data processing.
* The right to object to data processing.
* The right to data portability.
* The right to lodge a complaint with the supervisory authority.

## 6. Data Sharing
Personal data left on the website will not be sold or made available to third parties, in accordance with the provisions of the Personal Data Protection Act, with the exception of entities cooperating with the Administrator to the extent necessary to provide services (e.g. hosting providers, mailing systems, accounting services).

## 7. Changes to the Privacy Policy
We reserve the right to change the privacy policy of the website, which may be affected by the development of internet technology, possible changes in the law regarding personal data protection, and the development of our website. We will inform about any changes in a visible and understandable way.

## 8. Contact
If you have any doubts regarding any of the provisions of this privacy policy, we are available - our details can be found in the CONTACT tab or footer.$$,
    '1.0',
    DATE '2026-03-31',
    true
  ),
  (
    'terms',
    'Regulamin świadczenia usług',
    'Terms of Service',
    $$# Regulamin Świadczenia Usług Drogą Elektroniczną

## §1. Postanowienia Ogólne
1. Niniejszy Regulamin określa zasady korzystania z serwisu internetowego **VezVision**, dostępnego pod adresem vezvision.com.
2. Właścicielem serwisu jest **POLIFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ** z siedzibą w Bielsko-Białej, Złote Łany 11, 43-300 Bielsko-Biała, KRS: 0000831630, NIP: 5472217672, REGON: 385670222.
3. Kontakt z Usługodawcą możliwy jest za pośrednictwem adresu e-mail: **contact@vezvision.com**.

## §2. Definicje
1. **Użytkownik** - każda osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Serwisu.
2. **Usługa** - usługa świadczona drogą elektroniczną przez Usługodawcę na rzecz Użytkownika za pośrednictwem Serwisu.
3. **Formularz Kontaktowy** - interaktywny formularz dostępny w Serwisie umożliwiający Użytkownikowi kontakt z Usługodawcą.

## §3. Rodzaje i Zakres Usług
1. Usługodawca świadczy drogą elektroniczną następujące usługi:
   * Udostępnianie treści informacyjnych o ofercie i projektach (Portfolio).
   * Umożliwienie przesyłania zapytań poprzez Formularz Kontaktowy.
   * Umożliwienie zapisu na Newsletter (po wyrażeniu odrębnej zgody).
   * Udostępnianie wpisów blogowych i materiałów edukacyjnych.
2. Korzystanie z Serwisu jest dobrowolne i bezpłatne.

## §4. Warunki Świadczenia Usług
1. Wymagania techniczne niezbędne do współpracy z systemem teleinformatycznym, którym posługuje się Usługodawca:
   * Komputer, laptop lub inne urządzenie multimedialne z dostępem do Internetu.
   * Przeglądarka internetowa z obsługą JavaScript i plików cookies.
   * Dostęp do poczty elektronicznej (e-mail) - dla korzystania z formularza kontaktowego.
2. Użytkownik zobowiązany jest do korzystania z Serwisu w sposób zgodny z prawem i dobrymi obyczajami, mając na uwadze poszanowanie dóbr osobistych oraz praw autorskich i własności intelektualnej Usługodawcy oraz osób trzecich.
3. Zabronione jest dostarczanie przez Użytkownika treści o charakterze bezprawnym.

## §5. Warunki Zawierania i Rozwiązywania Umów
1. Umowa o świadczenie usługi polegającej na przeglądaniu treści informacyjnych zawierana jest na czas oznaczony i ulega rozwiązaniu z chwilą zamknięcia przez Użytkownika strony internetowej Serwisu.
2. Umowa o świadczenie usługi polegającej na udostępnieniu interaktywnego formularza umożliwiającego złożenie zapytania zawierana jest na czas oznaczony i ulega rozwiązaniu z chwilą przesłania zapytania przez Użytkownika.

## §6. Tryb Postępowania Reklamacyjnego
1. Reklamacje związane ze świadczeniem Usług Elektronicznych przez Usługodawcę Użytkownik może składać poprzez przesłanie wiadomości e-mail na adres: contact@vezvision.com.
2. Zaleca się podanie w opisie reklamacji: (1) informacji i okoliczności dotyczących przedmiotu reklamacji, w szczególności rodzaju i daty wystąpienia nieprawidłowości; (2) żądania Użytkownika; oraz (3) danych kontaktowych składającego reklamację – ułatwi to i przyspieszy rozpatrzenie reklamacji przez Usługodawcę.
3. Ustosunkowanie się do reklamacji przez Usługodawcę następuje niezwłocznie, nie później niż w terminie 14 dni kalendarzowych od dnia jej złożenia.

## §7. Własność Intelektualna
1. Wszystkie treści zamieszczone na stronie internetowej pod adresem vezvision.com (teksty, grafiki, logo, zdjęcia, pliki) korzystają z ochrony prawno-autorskiej i są własnością Usługodawcy.
2. Jakiekolwiek wykorzystanie przez kogokolwiek, bez wyraźnej pisemnej zgody Usługodawcy, któregokolwiek z elementów składających się na treść oraz zawartość strony vezvision.com stanowi naruszenie prawa autorskiego przysługującego Usługodawcy i skutkuje odpowiedzialnością cywilnoprawną oraz karną.

## §8. Postanowienia Końcowe
1. Umowy zawierane poprzez Serwis zawierane są w języku polskim (lub angielskim, zależnie od wyboru Użytkownika).
2. Usługodawca zastrzega sobie prawo do dokonywania zmian Regulaminu z ważnych przyczyn, to jest: zmiany przepisów prawa, zmiany sposobów płatności i dostaw - w zakresie, w jakim te zmiany wpływają na realizację postanowień niniejszego Regulaminu.
3. W sprawach nieuregulowanych w niniejszym Regulaminie mają zastosowanie powszechnie obowiązujące przepisy prawa polskiego.$$,
    $$# Terms of Service

## §1. General Provisions
1. These Regulations set out the rules for using the **VezVision** website, available at vezvision.com.
2. The owner of the website is **POLIFORM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ** with its registered office in Bielsko-Biała, Złote Łany 11, 43-300 Bielsko-Biała, KRS: 0000831630, NIP: 5472217672, REGON: 385670222.
3. Contact with the Service Provider is possible via e-mail address: **contact@vezvision.com**.

## §2. Definitions
1. **User** - any natural person, legal person or organizational unit without legal personality using the Website.
2. **Service** - a service provided electronically by the Service Provider to the User via the Website.
3. **Contact Form** - an interactive form available on the Website enabling the User to contact the Service Provider.

## §3. Types and Scope of Services
1. The Service Provider provides the following services electronically:
   * Providing information content about the offer and projects (Portfolio).
   * Enabling the submission of inquiries via the Contact Form.
   * Enabling subscription to the Newsletter (after separate consent).
   * Providing blog entries and educational materials.
2. Use of the Website is voluntary and free of charge.

## §4. Terms of Service
1. Technical requirements necessary for cooperation with the ICT system used by the Service Provider:
   * Computer, laptop or other multimedia device with Internet access.
   * Web browser with JavaScript and cookies enabled.
   * Access to e-mail (e-mail) - for using the contact form.
2. The User is obliged to use the Website in a manner consistent with the law and good manners, bearing in mind the respect for personal rights and copyrights and intellectual property of the Service Provider and third parties.
3. Providing illegal content by the User is prohibited.

## §5. Conditions for Concluding and Terminating Contracts
1. The contract for the provision of the service consisting in browsing information content is concluded for a definite period and is terminated when the User closes the Website.
2. The contract for the provision of the service consisting in providing an interactive form enabling the submission of an inquiry is concluded for a definite period and is terminated when the User sends the inquiry.

## §6. Complaint Procedure
1. Complaints related to the provision of Electronic Services by the Service Provider may be submitted by sending an e-mail to: contact@vezvision.com.
2. It is recommended to provide in the description of the complaint: (1) information and circumstances regarding the subject of the complaint, in particular the type and date of occurrence of the irregularity; (2) the User request; and (3) contact details of the person submitting the complaint – this will facilitate and speed up the consideration of the complaint by the Service Provider.
3. The Service Provider shall respond to the complaint immediately, no later than within 14 calendar days from the date of its submission.

## §7. Intellectual Property
1. All content posted on the website at vezvision.com (texts, graphics, logos, photos, files) is protected by copyright and is the property of the Service Provider.
2. Any use by anyone, without the express written consent of the Service Provider, of any of the elements constituting the content and content of the vezvision.com website constitutes a violation of the copyright belonging to the Service Provider and results in civil and criminal liability.

## §8. Final Provisions
1. Contracts concluded via the Website are concluded in Polish (or English, depending on the User choice).
2. The Service Provider reserves the right to make changes to the Regulations for important reasons, that is: changes in the law, changes in payment and delivery methods - to the extent that these changes affect the implementation of the provisions of these Regulations.
3. In matters not covered by these Regulations, generally applicable provisions of Polish law shall apply.$$,
    '1.0',
    DATE '2026-03-31',
    true
  ),
  (
    'cookie_policy',
    'Polityka Plików Cookies',
    'Cookie Policy',
    $$# Polityka Plików Cookies

## 1. Czym są pliki cookies?
Pliki cookies (tzw. "ciasteczka") to małe pliki tekstowe wysyłane przez serwis internetowy, który odwiedzasz, i zapisywane na Twoim urządzeniu końcowym (komputerze, laptopie, smartfonie), z którego korzystasz podczas przeglądania stron internetowych.

## 2. Jakich plików cookies używamy?
W ramach Serwisu VezVision stosowane są dwa zasadnicze rodzaje plików cookies: "sesyjne" (session cookies) oraz "stałe" (persistent cookies).

Cookies "sesyjne" są plikami tymczasowymi, które przechowywane są w urządzeniu końcowym Użytkownika do czasu wylogowania, opuszczenia strony internetowej lub wyłączenia oprogramowania (przeglądarki internetowej).

"Stałe" pliki cookies przechowywane są w urządzeniu końcowym Użytkownika przez czas określony w parametrach plików cookies lub do czasu ich usunięcia przez Użytkownika.

### Kategorie plików cookies:
1. **Niezbędne** - umożliwiają korzystanie z usług dostępnych w ramach Serwisu, np. uwierzytelniające pliki cookies wykorzystywane do usług wymagających uwierzytelniania w ramach Serwisu.
2. **Analityczne** - umożliwiają zbieranie informacji o sposobnie korzystania ze stron internetowych Serwisu, co pomaga nam ulepszać jego strukturę i zawartość.
3. **Funkcjonalne** - umożliwiają "zapamiętanie" wybranych przez Użytkownika ustawień i personalizację interfejsu Użytkownika, np. w zakresie wybranego języka lub regionu.

## 3. Do czego używamy plików cookies?
Stosujemy pliki cookies w następujących celach:
* Dostosowania zawartości stron internetowych Serwisu do preferencji Użytkownika oraz optymalizacji korzystania ze stron internetowych.
* Tworzenia anonimowych statystyk, które pomagają zrozumieć, w jaki sposób Użytkownicy Serwisu korzystają ze stron internetowych, co umożliwia ulepszanie ich struktury i zawartości.
* Utrzymania sesji Użytkownika Serwisu.

## 4. Zarządzanie plikami cookies
W wielu przypadkach oprogramowanie służące do przeglądania stron internetowych (przeglądarka internetowa) domyślnie dopuszcza przechowywanie plików cookies w urządzeniu końcowym Użytkownika.

Użytkownicy Serwisu mogą dokonać w każdym czasie zmiany ustawień dotyczących plików cookies. Ustawienia te mogą zostać zmienione w szczególności w taki sposób, aby blokować automatyczną obsługę plików cookies w ustawieniach przeglądarki internetowej bądź informować o ich każdorazowym zamieszczeniu w urządzeniu Użytkownika Serwisu.

Szczegółowe informacje o możliwości i sposobach obsługi plików cookies dostępne są w ustawieniach oprogramowania (przeglądarki internetowej). Ograniczenia stosowania plików cookies mogą wpłynąć na niektóre funkcjonalności dostępne na stronach internetowych Serwisu.$$,
    $$# Cookie Policy

## 1. What are cookies?
Cookies are small text files sent by the website you visit and stored on your end device (computer, laptop, smartphone) that you use when browsing websites.

## 2. What cookies do we use?
The VezVision Service uses two basic types of cookies: "session" cookies and "persistent" cookies.

"Session" cookies are temporary files that are stored on the User end device until logging out, leaving the website or turning off the software (web browser).

"Persistent" cookies are stored on the User end device for the time specified in the cookie parameters or until they are deleted by the User.

### Categories of cookies:
1. **Essential** - enabling the use of services available within the Website, e.g. authentication cookies used for services requiring authentication within the Website.
2. **Analytical** - enabling the collection of information on how the Website pages are used, which helps us improve its structure and content.
3. **Functional** - enabling the "remembering" of settings selected by the User and personalization of the User interface, e.g. in terms of the selected language or region.

## 3. What do we use cookies for?
We use cookies for the following purposes:
* Adjusting the content of the Website pages to the User preferences and optimizing the use of websites.
* Creating anonymous statistics that help to understand how Website Users use websites, which allows improving their structure and content.
* Maintaining the Website User session.

## 4. Managing cookies
In many cases, the software used to browse websites (web browser) allows cookies to be stored on the User end device by default.

Website Users can change cookie settings at any time. These settings can be changed in particular in such a way as to block the automatic handling of cookies in the web browser settings or to inform about their every posting on the Website User device.

Detailed information on the possibility and methods of handling cookies is available in the software (web browser) settings. Restrictions on the use of cookies may affect some of the functionalities available on the Website pages.$$,
    '1.0',
    DATE '2026-03-31',
    true
  )
ON CONFLICT (document_key) DO UPDATE
SET
  title_pl = EXCLUDED.title_pl,
  title_en = EXCLUDED.title_en,
  content_pl = EXCLUDED.content_pl,
  content_en = EXCLUDED.content_en,
  version = EXCLUDED.version,
  last_updated = EXCLUDED.last_updated,
  is_published = EXCLUDED.is_published;
