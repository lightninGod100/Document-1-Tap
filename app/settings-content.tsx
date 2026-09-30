import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  BackHandler,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Appbar, Button, Text, useTheme } from 'react-native-paper';

type ContentKey = 'faq' | 'contact' | 'privacy' | 'terms';

type ContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type SettingsContent = {
  title: string;
  intro?: string;
  sections: ContentSection[];
};

const EFFECTIVE_DATE = 'October 1, 2026';
const SUPPORT_EMAIL = 'moodlyapp25@gmail.com';

const CONTENT: Record<ContentKey, SettingsContent> = {
  faq: {
    title: 'FAQs',
    intro: 'Quick answers about using Document 1 Tap.',
    sections: [
      {
        heading: 'Where are my documents stored?',
        paragraphs: [
          'Documents and their details are stored locally in the app’s private storage on your device. Document 1 Tap does not upload them to a developer-operated server.',
        ],
      },
      {
        heading: 'Which file types can I add?',
        paragraphs: [
          'You can capture a photo, choose an image from your gallery, or select a PDF. PDFs can be up to 20 MB.',
        ],
      },
      {
        heading: 'Does the app back up or sync my documents?',
        paragraphs: [
          'No. The app does not currently provide its own cloud backup, account, sync, export-all, or device-transfer service. Your operating system’s backup settings may apply independently.',
        ],
      },
      {
        heading: 'How are my documents protected?',
        paragraphs: [
          'The app is protected by your four-digit PIN and supported device authentication such as fingerprint or face recognition. Files remain inside the app’s private storage.',
        ],
      },
      {
        heading: 'What happens if I forget my PIN?',
        paragraphs: [
          'There is currently no PIN recovery service because the app has no account or backend. Avoid clearing app storage or uninstalling unless you accept losing locally stored documents.',
        ],
      },
      {
        heading: 'Why does the app request camera, photo, or biometric access?',
        paragraphs: [
          'Camera and photo access let you add document images. Biometric access helps confirm that it is you when unlocking or performing sensitive actions. You can manage permissions in your device settings.',
        ],
      },
      {
        heading: 'How do I delete my information?',
        paragraphs: [
          'Delete an individual document from its details screen, or use Settings → Clear All Data to remove all saved documents and custom categories. Your PIN and app preferences are preserved by Clear All Data.',
        ],
      },
      {
        heading: 'Can the developer see my documents?',
        paragraphs: [
          'No. The app has no developer-operated backend, account, analytics, advertising, or document collection service.',
        ],
      },
    ],
  },
  contact: {
    title: 'Reach Us',
    intro: 'Need help, found a problem, or have a suggestion?',
    sections: [
      {
        heading: 'Email support',
        paragraphs: [
          `Contact lightninGod100 at ${SUPPORT_EMAIL}.`,
          'When reporting a problem, include your device model, operating-system version, app version, and the steps that led to the issue. Do not email document images, PINs, identification numbers, or other sensitive information.',
        ],
      },
      {
        heading: 'Privacy and legal questions',
        paragraphs: [
          'Use the same email address for questions about this Privacy Policy, the Terms of Service, or the app’s handling of information.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: `Effective date: ${EFFECTIVE_DATE}`,
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'Document 1 Tap is operated by lightninGod100. It is designed as an offline vault for document images, PDFs, and related details.',
          'The app has no user accounts, developer-operated backend, analytics, advertisements, or tracking. The developer does not receive or store your document contents or in-app activity.',
        ],
      },
      {
        heading: 'Information stored on your device',
        paragraphs: [
          'The app stores the content you choose to add, including document files, names, categories, notes, dates, favourite status, and other details you enter. It also stores your categories, theme preference, lockout state, and PIN-related information.',
          'Document files and metadata remain in the app’s private storage. The PIN is stored using secure storage supplied by your operating system.',
        ],
      },
      {
        heading: 'Permissions and device features',
        paragraphs: [
          'The app may request only the device access needed for features you choose to use:',
        ],
        bullets: [
          'Camera access to photograph a document.',
          'Photo-library or file access to select an image or PDF.',
          'Biometric authentication to unlock the app or confirm a sensitive action.',
          'File-system access to keep selected documents in the app’s private storage.',
        ],
      },
      {
        heading: 'Biometric information',
        paragraphs: [
          'Fingerprint, face, or other biometric matching is performed by your device and operating system. Document 1 Tap receives only the authentication result and does not receive or store your biometric template.',
        ],
      },
      {
        heading: 'Sharing and external apps',
        paragraphs: [
          'When you intentionally share a document, the selected content is passed to the destination you choose through the operating system. The receiving app or service applies its own privacy practices. lightninGod100 does not receive the shared content.',
        ],
      },
      {
        heading: 'Retention, deletion, and backups',
        paragraphs: [
          'Information remains on your device until you delete it, clear the app’s data, or uninstall the app. The operating system may retain app data in device or cloud backups according to your backup settings.',
          'You can delete individual documents or use Clear All Data in Settings. Clear All Data removes documents and custom categories but preserves the PIN, theme preference, and security lockout information.',
        ],
      },
      {
        heading: 'Children’s privacy',
        paragraphs: [
          'The app does not knowingly collect personal information from children or anyone else because it does not send personal information to the developer.',
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'This policy may be updated when the app’s features or data practices change. The updated policy will be included in the app with a revised effective date.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          `For privacy questions, email ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: `Effective date: ${EFFECTIVE_DATE}`,
    sections: [
      {
        heading: 'Acceptance',
        paragraphs: [
          'By using Document 1 Tap, you agree to these Terms of Service. If you do not agree, do not use the app.',
        ],
      },
      {
        heading: 'Purpose and licence',
        paragraphs: [
          'lightninGod100 grants you a limited, personal, non-exclusive, non-transferable, and revocable licence to use the app for lawful personal document organisation and storage.',
        ],
      },
      {
        heading: 'Your responsibilities',
        paragraphs: [
          'You are responsible for the documents you add, the accuracy of their details, keeping your device and PIN secure, and maintaining any backup you require.',
        ],
        bullets: [
          'Do not use the app to store or share content you do not have the right to possess or distribute.',
          'Do not misuse the app for fraud, impersonation, unlawful activity, or infringement of another person’s rights.',
          'Do not attempt to disrupt, reverse engineer, or circumvent the app’s security except where applicable law expressly permits it.',
        ],
      },
      {
        heading: 'No recovery or cloud-backup service',
        paragraphs: [
          'The app does not currently provide accounts, cloud sync, PIN recovery, or a developer-operated backup service. Loss, damage, reset, or replacement of your device—and clearing app storage or uninstalling the app—may permanently remove your documents.',
        ],
      },
      {
        heading: 'Sensitive information',
        paragraphs: [
          'You decide whether the app is appropriate for particular documents. Device access controls reduce casual access but no software or device can guarantee absolute security. Keep independent copies of documents you cannot afford to lose.',
        ],
      },
      {
        heading: 'Third-party services',
        paragraphs: [
          'If you share content with another app or open an external service, that third party’s terms and privacy practices apply. lightninGod100 is not responsible for third-party services.',
        ],
      },
      {
        heading: 'Availability and changes',
        paragraphs: [
          'The app is provided on an “as is” and “as available” basis. Features may be changed, suspended, or discontinued, and uninterrupted or error-free operation is not guaranteed.',
        ],
      },
      {
        heading: 'Disclaimer and limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by law, lightninGod100 disclaims implied warranties and is not liable for indirect, incidental, special, consequential, or punitive loss, including loss of data, documents, access, or opportunity arising from use of the app.',
          'Nothing in these terms excludes rights or liability that cannot legally be excluded.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of India, without regard to conflict-of-law principles. Courts with jurisdiction in India will have jurisdiction over disputes, subject to any mandatory consumer rights that apply to you.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'These terms may be updated as the app changes. Continued use after updated terms are made available means you accept the revised terms.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          `Questions about these terms can be sent to ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },
};

export default function SettingsContentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const contentKey: ContentKey =
    section === 'contact' || section === 'privacy' || section === 'terms'
      ? section
      : 'faq';
  const content = CONTENT[contentKey];

  const returnToSettings = useCallback(() => {
    router.replace('/(tabs)/settings');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          returnToSettings();
          return true;
        }
      );

      return () => subscription.remove();
    }, [returnToSettings])
  );

  const handleEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      'Document 1 Tap support'
    )}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open email', `Please email us at ${SUPPORT_EMAIL}.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={returnToSettings} />
        <Appbar.Content title={content.title} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {content.intro ? (
          <Text
            variant="bodyLarge"
            style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}
          >
            {content.intro}
          </Text>
        ) : null}

        {content.sections.map((item) => (
          <View key={item.heading} style={styles.section}>
            <Text variant="titleMedium" style={styles.heading}>
              {item.heading}
            </Text>
            {item.paragraphs.map((paragraph) => (
              <Text
                key={paragraph}
                variant="bodyMedium"
                style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}
              >
                {paragraph}
              </Text>
            ))}
            {item.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <Text
                  variant="bodyMedium"
                  style={[styles.bullet, { color: theme.colors.primary }]}
                >
                  •
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.bulletText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {bullet}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {contentKey === 'contact' ? (
          <Button
            mode="contained"
            icon="email-outline"
            onPress={handleEmail}
            style={styles.emailButton}
          >
            Email Support
          </Button>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  intro: {
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  bullet: {
    marginRight: 10,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  emailButton: {
    marginTop: 4,
  },
});
