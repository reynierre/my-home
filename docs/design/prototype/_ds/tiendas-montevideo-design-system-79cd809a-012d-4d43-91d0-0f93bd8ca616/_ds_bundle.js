/* @ds-bundle: {"format":4,"namespace":"TiendasMontevideoDesignSystem_79cd80","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Badge","sourcePath":"components/commerce/Badge.jsx"},{"name":"CategoryTile","sourcePath":"components/commerce/CategoryTile.jsx"},{"name":"PriceTag","sourcePath":"components/commerce/PriceTag.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"Rating","sourcePath":"components/commerce/Rating.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SectionHeading","sourcePath":"components/layout/SectionHeading.jsx"},{"name":"Icon","sourcePath":"components/media/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/media/Icon.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"a20a07754511","components/actions/IconButton.jsx":"a0f562c72095","components/commerce/Badge.jsx":"720aa37ee5d7","components/commerce/CategoryTile.jsx":"f859cba7764d","components/commerce/PriceTag.jsx":"cf8e55539a4a","components/commerce/ProductCard.jsx":"2a04d2b107f7","components/commerce/Rating.jsx":"a626b39ef99a","components/forms/Input.jsx":"7576cb9b9d96","components/layout/SectionHeading.jsx":"5117782b8488","components/media/Icon.jsx":"262ae755cf9c"},"inlinedExternals":[],"unexposedExports":[{"name":"formatUYU","sourcePath":"components/commerce/PriceTag.jsx"}]} */

(() => {

const __ds_ns = (window.TiendasMontevideoDesignSystem_79cd80 = window.TiendasMontevideoDesignSystem_79cd80 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary call-to-action for Tiendas Montevideo.
 * Mirrors site CTAs like "Ver Todos", "Añadir al carrito", "Ver Más".
 */
function Button({
  children,
  variant = 'primary',
  // 'primary' | 'secondary' | 'ghost'
  size = 'md',
  // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  onClick,
  type = 'button',
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 14px',
      fontSize: 'var(--fs-sm)',
      gap: '6px'
    },
    md: {
      padding: '12px 22px',
      fontSize: 'var(--fs-body)',
      gap: '8px'
    },
    lg: {
      padding: '15px 30px',
      fontSize: 'var(--fs-body-lg)',
      gap: '10px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      border: '1px solid var(--color-primary)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-strong)',
      border: '1px solid var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid transparent'
    }
  };
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes[size].gap,
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-semibold)',
    lineHeight: 1,
    letterSpacing: '0.01em',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
    ...sizes[size],
    ...variants[variant]
  };
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverStyle = !disabled && hover ? variant === 'primary' ? {
    background: 'var(--color-primary-hover)',
    borderColor: 'var(--color-primary-hover)'
  } : variant === 'secondary' ? {
    background: 'var(--surface-muted)'
  } : {
    background: 'var(--blue-50)'
  } : {};
  const activeStyle = !disabled && active ? {
    transform: 'translateY(1px)'
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      ...base,
      ...hoverStyle,
      ...activeStyle
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — circular utility button used on product cards and header
 * (wishlist heart, quick-view, cart, search).
 */
function IconButton({
  children,
  label,
  variant = 'soft',
  // 'soft' | 'solid' | 'plain'
  size = 'md',
  // 'sm' | 'md' | 'lg'
  active = false,
  onClick,
  ...rest
}) {
  const dims = {
    sm: 32,
    md: 40,
    lg: 48
  }[size];
  const variants = {
    soft: {
      background: 'var(--white)',
      color: 'var(--text-strong)',
      boxShadow: 'var(--shadow-sm)'
    },
    solid: {
      background: 'var(--color-primary)',
      color: '#fff',
      boxShadow: 'none'
    },
    plain: {
      background: 'transparent',
      color: 'var(--text-strong)',
      boxShadow: 'none'
    }
  };
  const [hover, setHover] = React.useState(false);
  const activeColor = active ? {
    color: 'var(--color-primary)'
  } : {};
  const hoverStyle = hover ? variant === 'solid' ? {
    background: 'var(--color-primary-hover)'
  } : {
    color: 'var(--color-primary)'
  } : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dims,
      height: dims,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      ...variants[variant],
      ...activeColor,
      ...hoverStyle
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/commerce/Badge.jsx
try { (() => {
/**
 * Badge — small label for product cards: sale flag, category eyebrow,
 * or stock status. Matches "¡Oferta!", "2 Plazas", "Sin existencias".
 */
function Badge({
  children,
  tone = 'sale',
  size = 'md'
}) {
  const tones = {
    sale: {
      background: 'var(--badge-sale-bg)',
      color: 'var(--badge-sale-text)'
    },
    neutral: {
      background: 'var(--badge-neutral-bg)',
      color: 'var(--badge-neutral-text)'
    },
    soft: {
      background: 'var(--blue-50)',
      color: 'var(--blue-700)'
    },
    stock: {
      background: 'var(--green-50)',
      color: 'var(--green-500)'
    },
    out: {
      background: 'var(--slate-200)',
      color: 'var(--slate-600)'
    }
  };
  const sizes = {
    sm: {
      fontSize: '10px',
      padding: '3px 8px'
    },
    md: {
      fontSize: '11px',
      padding: '4px 10px'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      letterSpacing: '0.03em',
      lineHeight: 1,
      borderRadius: 'var(--radius-pill)',
      ...sizes[size],
      ...tones[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Badge.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PriceTag.jsx
try { (() => {
/** Formats a number as Uruguayan pesos: $1.090,00 */
function formatUYU(value) {
  return '$' + Number(value).toLocaleString('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * PriceTag — regular price, or struck original + red sale price.
 * Matches the store pattern (e.g. ~$1.090,00~ → $926,50).
 */
function PriceTag({
  price,
  compareAt = null,
  size = 'md',
  align = 'left'
}) {
  const scale = {
    sm: 15,
    md: 18,
    lg: 24
  }[size];
  const onSale = compareAt != null && Number(compareAt) > Number(price);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      fontFamily: 'var(--font-display)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, onSale && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: scale * 0.72 + 'px',
      color: 'var(--price-strike)',
      textDecoration: 'line-through',
      fontWeight: 500
    }
  }, formatUYU(compareAt)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: scale + 'px',
      fontWeight: 700,
      color: onSale ? 'var(--price-sale)' : 'var(--price-regular)'
    }
  }, formatUYU(price)));
}
Object.assign(__ds_scope, { formatUYU, PriceTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PriceTag.jsx", error: String((e && e.message) || e) }); }

// components/media/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon — thin wrapper over Lucide glyph path data (ISC-licensed, open source).
 * Substituted set: the store's real icons could not be extracted (hotlink
 * protection). See readme ICONOGRAPHY. Consistent 1.75px stroke.
 */
const PATHS = {
  heart: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  search: 'M21 21l-4.34-4.34 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2Z',
  chevronRight: 'M9 18l6-6-6-6',
  chevronDown: 'M6 9l6 6 6-6',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  x: 'M18 6 6 18 M6 6l12 12',
  truck: 'M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1 M14 9h4l4 4v4a1 1 0 0 1-1 1h-1 M8 18h6 M7.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z M20.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  trash: 'M3 6h18 M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'
};
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  filled = false,
  color = 'currentColor',
  ...rest
}) {
  const d = PATHS[name];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? color : 'none',
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none'
    }
  }, rest), (d || '').split(' M').map((seg, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: i === 0 ? seg : 'M' + seg
  })));
}
const ICON_NAMES = Object.keys(PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/Icon.jsx", error: String((e && e.message) || e) }); }

// components/commerce/CategoryTile.jsx
try { (() => {
/**
 * CategoryTile — full-bleed image tile linking to a category, with a title
 * and "Ver Más" affordance. Matches the "DORMITORIO" / "DECORACIÓN" blocks.
 */
function CategoryTile({
  title,
  subtitle = null,
  image = null,
  cta = 'Ver Más',
  height = 300,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      height,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      cursor: 'pointer',
      background: 'var(--slate-200)'
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      transform: hover ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform var(--dur-slow) var(--ease-out)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--slate-400)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bag",
    size: 44
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(27,22,19,0.72) 0%, rgba(27,22,19,0.15) 45%, rgba(27,22,19,0) 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 22,
      right: 22,
      bottom: 20,
      color: '#fff'
    }
  }, subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      opacity: 0.9,
      marginBottom: 4
    }
  }, subtitle), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '24px',
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: 10
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '13px',
      borderBottom: '2px solid ' + (hover ? 'var(--green-400)' : 'rgba(255,255,255,0.7)'),
      paddingBottom: 2,
      transition: 'border-color var(--dur-fast) var(--ease-standard)'
    }
  }, cta, " ", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronRight",
    size: 16
  }))));
}
Object.assign(__ds_scope, { CategoryTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/CategoryTile.jsx", error: String((e && e.message) || e) }); }

// components/commerce/Rating.jsx
try { (() => {
/**
 * Rating — 5-star product rating (e.g. "Valorado con 5 de 5").
 */
function Rating({
  value = 0,
  count = null,
  size = 16,
  showValue = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: '1px'
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    key: i,
    name: "star",
    size: size,
    filled: i < Math.round(value),
    color: i < Math.round(value) ? 'var(--rating-star)' : 'var(--slate-300)'
  }))), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, value.toFixed(1)), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, "(", count, ")"));
}
Object.assign(__ds_scope, { Rating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Rating.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
/**
 * ProductCard — the core catalogue tile. Image with hover wishlist + quick
 * view, sale badge, category eyebrow, title, optional rating, price.
 */
function ProductCard({
  title,
  category,
  price,
  compareAt = null,
  image = null,
  saleLabel = null,
  // e.g. "¡Oferta!"
  rating = null,
  // number 0–5
  reviewCount = null,
  outOfStock = false,
  liked = false,
  onToggleWishlist,
  onQuickView,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const onSale = compareAt != null && Number(compareAt) > Number(price);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      transition: 'box-shadow var(--dur-med) var(--ease-standard), transform var(--dur-med) var(--ease-standard)',
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      transform: hover ? 'translateY(-2px)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '1 / 1',
      background: 'var(--slate-100)',
      cursor: 'pointer'
    },
    onClick: onClick
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--slate-400)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bag",
    size: 40
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 10,
      left: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, (saleLabel || onSale) && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "sale",
    size: "sm"
  }, saleLabel || '¡Oferta!'), outOfStock && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "out",
    size: "sm"
  }, "Sin existencias")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 8,
      right: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    label: "A\xF1adir a favoritos",
    size: "sm",
    active: liked,
    onClick: e => {
      e.stopPropagation();
      onToggleWishlist && onToggleWishlist();
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "heart",
    size: 17,
    filled: liked
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 10,
      right: 10,
      bottom: 10,
      transform: hover ? 'translateY(0)' : 'translateY(8px)',
      opacity: hover ? 1 : 0,
      transition: 'opacity var(--dur-med) var(--ease-standard), transform var(--dur-med) var(--ease-standard)',
      pointerEvents: hover ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onQuickView && onQuickView();
    },
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      background: 'rgba(27,22,19,0.9)',
      color: '#fff',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      padding: '10px',
      cursor: 'pointer',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "eye",
    size: 16
  }), " Vista R\xE1pida"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1
    }
  }, category && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, category), /*#__PURE__*/React.createElement("a", {
    onClick: onClick,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: 1.35,
      color: 'var(--text-strong)',
      textDecoration: 'none',
      cursor: 'pointer',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, title), rating != null && /*#__PURE__*/React.createElement(__ds_scope.Rating, {
    value: rating,
    count: reviewCount,
    size: 14
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PriceTag, {
    price: price,
    compareAt: compareAt,
    size: "md"
  }))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field with optional leading icon. Used for the store search
 * ("Buscar"), account forms and newsletter signup.
 */
function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  icon = null,
  // Icon name string, e.g. "search"
  size = 'md',
  // 'md' | 'lg'
  fullWidth = true,
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === 'lg' ? '14px 16px' : '11px 14px';
  const fs = size === 'lg' ? 'var(--fs-body-lg)' : 'var(--fs-body)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: fullWidth ? '100%' : 'auto',
      background: disabled ? 'var(--surface-muted)' : 'var(--white)',
      border: '1px solid ' + (focus ? 'var(--color-primary)' : 'var(--border-default)'),
      borderRadius: 'var(--radius-md)',
      padding: pad,
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: fs,
      color: 'var(--text-strong)'
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/layout/SectionHeading.jsx
try { (() => {
/**
 * SectionHeading — centered or left-aligned section title used across the
 * homepage ("LO MÁS VENDIDO", "DESCUENTOS EXCLUSIVOS WEB") with an optional
 * "Ver Todos" link.
 */
function SectionHeading({
  title,
  eyebrow = null,
  align = 'center',
  // 'center' | 'left'
  linkLabel = null,
  // e.g. "Ver Todos"
  onLink,
  underline = true
}) {
  const centered = align === 'center';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: centered ? 'center' : 'flex-end',
      flexDirection: centered ? 'column' : 'row',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: centered ? 'center' : 'left'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--color-primary)',
      marginBottom: 6
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: '28px',
      fontWeight: 800,
      letterSpacing: '-0.01em',
      color: 'var(--text-strong)',
      textTransform: 'uppercase'
    }
  }, title), underline && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 3,
      background: 'var(--color-primary)',
      borderRadius: 'var(--radius-pill)',
      margin: centered ? '12px auto 0' : '12px 0 0'
    }
  })), linkLabel && !centered && /*#__PURE__*/React.createElement("a", {
    onClick: onLink,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: '14px',
      color: 'var(--text-link)',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    }
  }, linkLabel, " ", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronRight",
    size: 16
  })));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SectionHeading.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.CategoryTile = __ds_scope.CategoryTile;

__ds_ns.PriceTag = __ds_scope.PriceTag;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.Rating = __ds_scope.Rating;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

})();
