import { useStatesContext } from '@/contexts/states';
import { ReactComponent as SwitchIcon } from '@/assets/theme-switcher.svg';

const ThemeSwitcher = () => {
  const { toggleTheme } = useStatesContext();

  return <button className='theme-switcher' onClick={() => toggleTheme()}>
    <SwitchIcon />
  </button>;
};

export default ThemeSwitcher;
