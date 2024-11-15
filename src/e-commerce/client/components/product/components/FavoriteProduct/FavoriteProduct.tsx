import { useAuthStore } from "@store/AuthState";
import { ShoppingAppAction, useShoppingAppStore } from "@store/ShoppingAppState";
import React from "react";
import { TabValue } from "../../ProductFull";
import "./FavoriteProduct.scss";

interface IFavoriteProductProps {
  tab: (value: TabValue) => void;
  productId: string;
}

const FavoriteProduct = ({ tab, productId }: IFavoriteProductProps) => {
  const {
    open: openShoppingApp,
    setOpen: setOpenShoppingApp,
    setAction: setActionShoppingApp,
    action: actionShoppingApp
  } = useShoppingAppStore();

  const { isPremium: isPremiumUser, user } = useAuthStore();

  const toggleFavorite = async () => {
    setActionShoppingApp(
      actionShoppingApp === ShoppingAppAction.FAVORITE ? ShoppingAppAction.UNFAVORITE : ShoppingAppAction.FAVORITE
    );
    setOpenShoppingApp(!openShoppingApp);
  };

  return (
    <>
      {isPremiumUser && (
        <div className="sd-favorite-product">
          <button type="button" onClick={toggleFavorite} className="sd-favorite-product__button">
            {actionShoppingApp === ShoppingAppAction.FAVORITE ? "★" : "☆"}
          </button>
        </div>
      )}
    </>
  );
};

export default FavoriteProduct;
