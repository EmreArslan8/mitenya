const styles = {
  cardBody: {
    py: 1,
    px: 2,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    width: '100%',
    gap: 1,
    borderRadius: 0.5,
  },
  line: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    fontSize: 14,
    width: '100%',
    fontStyle: 'italic',
    wordBreak: 'break-all',
    textAlign: 'end',
    px: '2px',
  },
  addressSection: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
};

export default styles;
