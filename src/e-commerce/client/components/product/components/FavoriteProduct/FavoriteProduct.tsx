import React, { useState } from "react";
import "./FavoriteProduct.scss";
import { TabValue } from "../../ProductFull";
import { useAuthStore } from "@store/AuthState";

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
    tab(TabValue.Lists);
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      {isPremiumUser && (
        <div className="sd-favorite-product">
          <button onClick={toggleFavorite} className="sd-favorite-product__button">
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      )}
    </>
  );
};

export default FavoriteProduct;
