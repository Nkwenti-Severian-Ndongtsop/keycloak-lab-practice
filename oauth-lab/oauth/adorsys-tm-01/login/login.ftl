<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("doLogIn")}
    <#elseif section = "form">
    <div id="kc-form">
      <div id="kc-form-wrapper">
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <!-- Username/Email Field -->
                <#if !usernameHidden??>
                    <div class="${properties.kcFormGroupClass!}">
                        <label for="username" class="${properties.kcLabelClass!}">
                            <span class="label-text">${msg("usernameOrEmail")}</span>
                        </label>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input tabindex="1" id="username" class="${properties.kcInputClass!}" name="username"
                                   value="${(login.username!'')}"  type="text" autofocus autocomplete="off"
                                   aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                            />
                            <#if messagesPerField.existsError('username','password')>
                                <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                            
                            </#if>
                        </div>
                    </div>
                </#if>

                <!-- Password Field -->
                <div class="${properties.kcFormGroupClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">
                        <span class="label-text">${msg("password")}</span>
                    </label>
                    <div class="${properties.kcInputWrapperClass!}">
                        <input tabindex="2" id="password" class="${properties.kcInputClass!}" name="password"
                               type="password" autocomplete="off"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                        />
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input tabindex="4" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                </div>
            </form>
        </#if>
        </div>
    </div>
    </#if>
</@layout.registrationLayout>