import React, { useMemo } from "react";
import { useAuthStore } from "@store/AuthState";

interface ProductChatProps {
  product: any;
  width?: string | number;
  height?: string | number;
}

const ProductChat: React.FC<ProductChatProps> = ({ product, width = "100%", height = "600px" }) => {
  const { session } = useAuthStore((state) => ({ session: state.session }));

  const chatUrl = useMemo(() => {
    const baseUrl = "https://www.joinsafedeal.com/chat";
    const productUrl = product?.product?.url || "";
    const encodedProductUrl = encodeURIComponent(productUrl);
    const userId = session?.user?.id || "";
    return `${baseUrl}?url=${encodedProductUrl}&userId=${userId}`;
  }, [product, session]);

  return (
    <div className="product-chat-container" style={{ width, height }}>
      <iframe src={chatUrl} title="Product Chat" width="100%" height="100%" frameBorder="0" allowFullScreen />
    </div>
  );
};

export default ProductChat;
