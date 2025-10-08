package com.syun.posleep.query;

public interface RecipeSheetRow {
    Integer getId();

    String getCategory();
    String getName();

    String getIngredient1();
    Integer getNeed1();
    Integer getReq1();

    String getIngredient2();
    Integer getNeed2();
    Integer getReq2();

    String getIngredient3();
    Integer getNeed3();
    Integer getReq3();

    String getIngredient4();
    Integer getNeed4();
    Integer getReq4();

    Integer getTotalQuantity();

    boolean getIsRegistered();
    boolean getIsTarget();

    Integer getEnergy();
}
