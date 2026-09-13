const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});
