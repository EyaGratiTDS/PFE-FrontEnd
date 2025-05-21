import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { vcardService, blockService } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp,
  FaTelegram, FaPinterest, FaReddit,
  FaDiscord,
  FaTwitch,
  FaSnapchat,
  FaSpotify,
  FaTiktok,
  FaYoutube,
  FaInstagram
} from 'react-icons/fa';
import { VCard, Block, BlockIconConfig } from './../../services/vcard';
import VCardHeader from './VCardHeader';
import ContactBlock from './../../cards/ContactBlock';
import FloatingButtons from './../../atoms/buttons/FloatingButtons';
import { motion } from "framer-motion";

const ViewVCard: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const [vcard, setVCard] = useState<VCard | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [vcardActive, setVcardActive] = useState(false);

  const blockIcons: Record<string, BlockIconConfig> = {
    'Phone': {
      icon: FaPhone,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    'Email': {
      icon: FaEnvelope,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
    },
    'Address': {
      icon: FaMapMarkerAlt,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Link': {
      icon: FaLink,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'Facebook': {
      icon: FaFacebook,
      gradient: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-600/20'
    },
    'Twitter': {
      icon: FaTwitter,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Instagram': {
      icon: FaInstagram,
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      shadow: 'shadow-pink-500/20'
    },
    'Youtube': {
      icon: FaYoutube,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Whatsapp': {
      icon: FaWhatsapp,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Tiktok': {
      icon: FaTiktok,
      gradient: 'from-gray-900 via-gray-800 to-gray-700',
      shadow: 'shadow-gray-900/20'
    },
    'Telegram': {
      icon: FaTelegram,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Spotify': {
      icon: FaSpotify,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Pinterest': {
      icon: FaPinterest,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Linkedin': {
      icon: FaLinkedin,
      gradient: 'from-blue-700 to-blue-800',
      shadow: 'shadow-blue-700/20'
    },
    'Snapchat': {
      icon: FaSnapchat,
      gradient: 'from-yellow-400 to-yellow-500',
      shadow: 'shadow-yellow-400/20'
    },
    'Twitch': {
      icon: FaTwitch,
      gradient: 'from-purple-600 to-purple-700',
      shadow: 'shadow-purple-600/20'
    },
    'Discord': {
      icon: FaDiscord,
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20'
    },
    'Reddit': {
      icon: FaReddit,
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20'
    },
    'default': {
      icon: FaLink,
      gradient: 'from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20'
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vcardData = await vcardService.getByUrl(url || '');
        setVCard(vcardData);

        if (vcardData.id) {

          await vcardService.registerView(vcardData.id);

          const blocksData = await blockService.getByVcardId(vcardData.id);

          setBlocks(blocksData.data);
        }
      } catch (error:any) {
        if (error.response?.data?.isNotActive) {
          setVcardActive(true);
        } else {
          toast.error("Error loading data");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  useEffect(() => {
    if (vcard?.favicon) {
      const existingLinks = document.querySelectorAll("link[rel~='icon']");
      existingLinks.forEach(link => {
        document.head.removeChild(link);
      });

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = vcard.favicon;
      document.head.appendChild(link);
    }
  }, [vcard]);

  const currentUrl = window.location.href;
  const pageTitle = vcard?.name || 'Digital Business Card';
  const pageDescription = vcard?.description || 'Connect with me using my digital business card';
  const pageImage = vcard?.logo || `${window.location.origin}/default-og-image.jpg`;

  const getBackgroundStyle = () => {
    if (!vcard) return {};

    switch (vcard.background_type) {
      case 'color':
        return { backgroundColor: vcard.background_value };
      case 'custom-image':
        return {
          backgroundImage: `url(${vcard.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'gradient':
      case 'gradient-preset':
        return {
          background: vcard.background_value,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#f8fafc' };
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const handleBlockAction = (type: string, value: string) => {
    switch (type) {
      case 'Phone':
        window.location.href = `tel:${value}`;
        break;
      case 'Email':
        window.location.href = `mailto:${value}`;
        break;
      case 'Address':
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`, '_blank');
        break;
      default:
        window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
        break;
    }
  };

  const handleDownloadVcf = () => {
    if (!vcard) return;

    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${vcard.name}
N:;${vcard.name};;;
URL:${currentUrl}
NOTE:${vcard.description || ''}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${vcard.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const shareOnSocial = (platform: string) => {
    const shareUrl = encodeURIComponent(currentUrl);
    const title = encodeURIComponent(pageTitle);
    const description = encodeURIComponent(pageDescription);
    const imageUrl = encodeURIComponent(pageImage);

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${title}&picture=${imageUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'email':
        const emailSubject = `Check out my digital business card: ${pageTitle}`;
        const emailBody = `${pageDescription}\n\nView my card: ${currentUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}&hashtags=DigitalBusinessCard`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${title}%20-%20${shareUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'telegram':
        window.open(
          `https://t.me/share/url?url=${shareUrl}&text=${title}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'pinterest':
        window.open(
          `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${description}&media=${imageUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'reddit':
        window.open(
          `https://www.reddit.com/submit?url=${shareUrl}&title=${title}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (vcardActive) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (!vcard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">vCard not found</h1>
          <p className="text-primary mt-2">
            The vCard you're looking for doesn't exist or has been deleted or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 bg-gray-50 relative"
      style={{
        ...getBackgroundStyle(),
        fontFamily: vcard.font_family || 'sans-serif',
        fontSize: `${vcard.font_size || 16}px`
      }}
    >
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      {vcard.background_type === 'custom-image' && (
        <div className="fixed inset-0 bg-black/10 z-0"></div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        <VCardHeader vcard={vcard} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {blocks.filter((block: Block) => block.status).map((block) => {
            const iconConfig = blockIcons[block.type_block as keyof typeof blockIcons] || blockIcons.default;
            return (
              <ContactBlock
                key={block.id}
                block={block}
                iconConfig={iconConfig}
                onClick={() => handleBlockAction(block.type_block, block.description)}
              />
            );
          })}
        </div>

        <FloatingButtons
          qrCodeUrl={vcard.qr_code}
          isShareEnabled={vcard.is_share}
          onCopy={copyToClipboard}
          onShare={shareOnSocial}
          onDownloadVcf={handleDownloadVcf}
          vcard={{
            name: vcard.name,
            url: vcard.url
          }}
        />

        {copied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 left-6 bg-gray-800 text-white px-4 py-2 rounded text-sm shadow z-50"
          >
            Link copied!
          </motion.div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="rounded shadow font-medium"
        hideProgressBar
      />
    </div>
  );
};

export default ViewVCard;