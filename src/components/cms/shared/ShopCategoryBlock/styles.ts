import { CSSProperties } from "react";

const useStyles = ({ variant }: { variant: 'default' | 'featured' }) => ({
  card: {
    position: 'relative',
    borderRadius: 2,
    overflow: 'hidden',
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
  },

  cardBody: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: 'white',
  },

  image: {
    padding: '10px',
  }as CSSProperties,

  textContainer: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'blue',
  },

  label: {
    alignSelf: 'flex-start',
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: 'yellow',
    color: 'black',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.3,
    color: 'black',
  },

  buttonLabel: {
    marginTop: '10px',
    fontSize: 13,
    fontWeight: 500,
    color: 'black',
  },
});

export default useStyles;
