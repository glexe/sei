import { useI18n } from '../../hooks/useI18n/useI18n';
import { useNavStack } from '../../hooks/useNavStack/useNavStack';
import { AudioTrack } from '../../icons/AudioTrack';
import { Globe } from '../../icons/Globe';
import { Subtitles } from '../../icons/Subtitles';
import { Screen } from '../../primitives/Screen/Screen';
import { About } from '../About/About';
import { DateTimeSettings } from '../DateTimeSettings/DateTimeSettings';
import { LanguageSettings } from '../LanguageSettings/LanguageSettings';
import { LocationSearch } from '../LocationSearch/LocationSearch';
import { PlayerSettings } from '../PlayerSettings/PlayerSettings';
import { SettingsHome } from '../SettingsHome/SettingsHome';
import { WallpaperPicker } from '../WallpaperPicker/WallpaperPicker';
import { WallpaperSettings } from '../WallpaperSettings/WallpaperSettings';
import { WeatherSettings } from '../WeatherSettings/WeatherSettings';
import type { Props, ScreenId } from './types';

export function Settings({ settings, onChange, onClose }: Props) {
  const { t } = useI18n();
  const nav = useNavStack<ScreenId>('home');
  const list = { focus: nav.top.focus, onFocus: nav.setFocus };
  // Picking a value on a choice screen saves it and goes back, like tvOS.
  const pick = (patch: Parameters<typeof onChange>[0]) => {
    onChange(patch);
    nav.pop();
  };

  const content = () => {
    switch (nav.top.screen) {
      case 'wallpaper':
        return (
          <WallpaperSettings {...list} settings={settings} onOpen={nav.push} onBack={nav.pop} />
        );
      case 'pictures':
      case 'colors':
      case 'gradients':
        return (
          <WallpaperPicker
            {...list}
            kind={nav.top.screen}
            selected={settings.wallpaper}
            onSelect={(wallpaper) => onChange({ wallpaper })}
            onBack={nav.pop}
          />
        );
      case 'weather':
        return (
          <WeatherSettings
            {...list}
            settings={settings}
            onChange={onChange}
            onOpenLocation={() => nav.push('location')}
            onBack={nav.pop}
          />
        );
      case 'location':
        return (
          <LocationSearch
            current={settings.weatherPlace}
            onSelect={(place) => pick({ weatherPlace: place })}
            onBack={nav.pop}
          />
        );
      case 'player':
        return <PlayerSettings {...list} settings={settings} onOpen={nav.push} onBack={nav.pop} />;
      case 'audioLanguage':
        return (
          <LanguageSettings
            {...list}
            title={t('player.audioLanguage')}
            icon={AudioTrack}
            caption={t('player.audioLanguageCaption')}
            noneLabel={t('common.default')}
            value={settings.audioLanguage}
            onSelect={(code) => pick({ audioLanguage: code })}
            onBack={nav.pop}
          />
        );
      case 'subtitleLanguage':
        return (
          <LanguageSettings
            {...list}
            title={t('player.subtitleLanguage')}
            icon={Subtitles}
            caption={t('player.subtitleLanguageCaption')}
            noneLabel={t('common.off')}
            value={settings.subtitleLanguage}
            onSelect={(code) => pick({ subtitleLanguage: code })}
            onBack={nav.pop}
          />
        );
      case 'dateTime':
        return (
          <DateTimeSettings {...list} settings={settings} onChange={onChange} onBack={nav.pop} />
        );
      case 'about':
        return <About {...list} onBack={nav.pop} />;
      case 'language':
        return (
          <LanguageSettings
            {...list}
            title={t('language.title')}
            icon={Globe}
            caption={t('language.caption')}
            noneLabel={t('language.tv')}
            native
            value={settings.language}
            onSelect={(code) => pick({ language: code })}
            onBack={nav.pop}
          />
        );
      default:
        return <SettingsHome {...list} settings={settings} onOpen={nav.push} onClose={onClose} />;
    }
  };

  return <Screen back={nav.wentBack}>{content()}</Screen>;
}
