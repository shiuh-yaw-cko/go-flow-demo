var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var pk = "pk_test_7bb5881a-835c-4a4a-8d8c-1fb90c318082";

Frames.init(pk);

Frames.addEventHandler(Frames.Events.FRAME_ACTIVATED, onActivated);
function onActivated(event) {
  var e = event.element;
  console.log("onActivated");
  console.log(e);
  console.log(event);
}

Frames.addEventHandler(Frames.Events.READY, onReady);
function onReady(event) {
  var e = event.element;
  console.log("onReady");
  console.log(e);
  console.log(event);
}

var logos = generateLogos();
function generateLogos() {
  var logos = {};
  logos["card-number"] = {
    src: "card",
    alt: "card number logo",
  };
  logos["expiry-date"] = {
    src: "exp-date",
    alt: "expiry date logo",
  };
  logos["cvv"] = {
    src: "cvv",
    alt: "cvv logo",
  };
  return logos;
}

var errors = {};
errors["card-number"] = "Please enter a valid card number";
errors["expiry-date"] = "Please enter a valid expiry date";
errors["cvv"] = "Please enter a valid cvv code";

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  var e = event.element;

  if (event.isValid || event.isEmpty) {
    if (e === "card-number" && !event.isEmpty) {
      showPaymentMethodIcon();
    }
    setDefaultIcon(e);
    clearErrorIcon(e);
    clearErrorMessage(e);
  } else {
    if (e === "card-number") {
      clearPaymentMethodIcon();
    }
    setDefaultErrorIcon(e);
    setErrorIcon(e);
    setErrorMessage(e);
  }
}

function clearErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = "";
}

function clearErrorIcon(el) {
  var logo = document.getElementById("icon-" + el + "-error");
  logo.style.removeProperty("display");
}

function showPaymentMethodIcon(parent, pm) {
  if (parent) parent.classList.add("show");

  var logo = document.getElementById("logo-payment-method");
  if (pm) {
    var name = pm.toLowerCase();
    logo.setAttribute("src", "/static/images/card-icons/" + name + ".svg");
    logo.setAttribute("alt", pm || "payment method");
  }
  logo.style.removeProperty("display");
}

function clearPaymentMethodIcon(parent) {
  if (parent) parent.classList.remove("show");

  var logo = document.getElementById("logo-payment-method");
  logo.style.setProperty("display", "none");
}

function setErrorMessage(el) {
  var selector = ".error-message__" + el;
  var message = document.querySelector(selector);
  message.textContent = errors[el];
}

function setDefaultIcon(el) {
  var selector = "icon-" + el;
  var logo = document.getElementById(selector);
  logo.setAttribute(
    "src",
    "/static/images/card-icons/" + logos[el].src + ".svg"
  );
  logo.setAttribute("alt", logos[el].alt);
}

function setDefaultErrorIcon(el) {
  var selector = "icon-" + el;
  var logo = document.getElementById(selector);
  logo.setAttribute(
    "src",
    "/static/images/card-icons/" + logos[el].src + "-error.svg"
  );
  logo.setAttribute("alt", logos[el].alt);
}

function setErrorIcon(el) {
  var logo = document.getElementById("icon-" + el + "-error");
  logo.style.setProperty("display", "block");
}

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  cardValidationChanged
);
function cardValidationChanged(event) {
  payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
  console.log("CARD_TOKENIZATION_FAILED: %o", error);
  Frames.init();
  Frames.enableSubmitForm();
}

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
  console.log("onCardTokenized Event: %o", event);
  Frames.addCardToken(form, event.token);
  form.submit();
}

Frames.addEventHandler(
  Frames.Events.PAYMENT_METHOD_CHANGED,
  paymentMethodChanged
);
function paymentMethodChanged(event) {
  var pm = event.paymentMethod;
  let container = document.querySelector(".icon-container.payment-method");

  if (!pm) {
    clearPaymentMethodIcon(container);
  } else {
    clearErrorIcon("card-number");
    showPaymentMethodIcon(container, pm);
  }
}

Frames.addEventHandler(Frames.Events.CARD_SUBMITTED, function () {
  payButton.disabled = true;
  // display loader
});

form.addEventListener("submit", onSubmit);
function onSubmit(event) {
  event.preventDefault();
  var name = document.getElementById("checkout-frames-customer-name").value;
  var address1 = document.getElementById("checkout-frames-address1").value;
  var address2 = document.getElementById("checkout-frames-address2").value;
  var postcode = document.getElementById("checkout-frames-postcode").value;
  var phone = document.getElementById("checkout-frames-phone").value;
  var city = document.getElementById("city").value;
  var country = document.getElementById("country-code").value;

  Frames.cardholder = {
    name: name,
    billingAddress: {
      addressLine1: address1,
      addressLine2: address2,
      zip: postcode,
      city: city,
      country: country,
    },
    phone: phone,
  };

  Frames.submitCard();
}

document.getElementById("clear-button").addEventListener("click", clear);

function clear() {
  form.reset();
  Frames.init(pk);
}

document
  .getElementById("clear-configuration-button")
  .addEventListener("click", clearConfig);

function clearConfig() {
  form.reset();
  Frames.init({
    publicKey: pk,
    style: {
      base: {
        color: "black",
        fontSize: "18px",
      },
      focus: {
        color: "blue",
      },
      valid: {
        color: "green",
      },
      invalid: {
        color: "red",
      },
      placeholder: {
        base: {
          color: "gray",
        },
        focus: {
          border: "solid 1px blue",
        },
      },
    },
  });
}
