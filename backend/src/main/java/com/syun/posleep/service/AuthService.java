package com.syun.posleep.service;

import com.syun.posleep.domain.Pot;
import com.syun.posleep.domain.User;
import com.syun.posleep.repository.IngredientRepository;
import com.syun.posleep.repository.PotRepository;
import com.syun.posleep.repository.RecipeRepository;
import com.syun.posleep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final PotRepository potRepository;

    @Transactional
    public void register(String userName, String encodedPassword) {
        User user = new User(userName, encodedPassword);
        userRepository.save(user);

        Pot pot = new Pot(user, 0, false, null);
        potRepository.save(pot);

        recipeRepository.initForUser(user.getId());

        ingredientRepository.initForUser(user.getId());
    }
}
