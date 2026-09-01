const styles = {
  root: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: { xs: 1, md: 1.5 },
    py: 0,
  },

  iconFrame: {
    // Mobilde daire kadraj; masaustunde ikon serbest duruyor.
    width: { xs: 72, md: 60 },
    height: { xs: 72, md: 60 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: { xs: '50%', md: 0 },
    // Notr acik gri dolgu (palette gray[50]).
    backgroundColor: { xs: '#F5F5F7', md: 'transparent' },
    overflow: 'hidden',
  },

  icon: {
    // Ikon daireyi dolduruyor, kenarda ince nefes payi kaliyor.
    width: { xs: '62%', md: '100%' },
    height: { xs: '62%', md: '100%' },
  },

  label: {
    fontSize: { xs: 12.5, md: 17 },
    lineHeight: { xs: 1.35, md: 1.4 },
    fontWeight: 600,
    color: 'text.primary',
    letterSpacing: '-0.005em',
  },

  textBlock: {
    gap: 0.5,
    maxWidth: { md: 300 },
  },

  description: {
    // Dar hucrede okunmuyor; vaadi ikon + baslik tasiyor.
    display: { xs: 'none', md: 'block' },
    color: 'text.secondary',
    fontSize: { xs: 13, md: 14 },
    lineHeight: 1.5,
  },
};

export default styles;
