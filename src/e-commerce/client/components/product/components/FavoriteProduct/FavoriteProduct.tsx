import React, { useState } from "react";
import "./FavoriteProduct.scss";
import { useAuthStore } from "@store/AuthState";
import { TabValue } from "../../ProductFull";

interface IFavoriteProductProps {
  tab: (value: TabValue) => void;
  action: (value: string) => void;
}

const FavoriteProduct = ({ tab, action }: IFavoriteProductProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { isPremiumUser, loading, session } = useAuthStore((state) => ({
    isPremiumUser: state.isPremium,
    loading: state.loading,
    session: state.session
  }));

  const setFlag = async () => {
    if (loading || !session) return;
    action("favorite_product");
  };

  const toggleFavorite = async () => {
    await setFlag();
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      {isPremiumUser && (
        <div className="sd-favorite-product">
          <button type="button" onClick={toggleFavorite} className="sd-favorite-product__button">
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      )}
    </>
  );
};

export default FavoriteProduct;
