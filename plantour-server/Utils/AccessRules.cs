using System.Runtime.Versioning;
using plantour_server.Models;

namespace plantour_server.Utils;

// [SupportedOSPlatform("windows")]
public class AccessRules
{
    private readonly List<AccessRule> _rules = new();
    private void AddRule(AccessRule rule)
    {
        _rules.Add(rule);
    }
    private void AddRuleWithValidation(AccessRule rule)
    {
        if (rule == null)
            throw new ArgumentNullException(nameof(rule));
        
        if (_rules.Any(r => r.Id == rule.Id))
            throw new InvalidOperationException("Rule with this Id already exists");

        if (_rules.Any(r => String.Compare(r.Name, rule.Name, StringComparison.OrdinalIgnoreCase) == 0))
            throw new InvalidOperationException("Rule with this name already exists");
        
        AddRule(rule);
    }

    public AccessRules()
    {
        AccessRule rule = new AccessRule()
        {
            Id = 10,
            Name = "Can add/edit/delete travelers"
        };
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 20,
            Name = "Can add/edit/delete shared items"
        };
        AddRuleWithValidation(rule);


        rule = new AccessRule()
        {
            Id = 30,
            Name = "Can add/edit/delete trips"
        };
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 40,
            Name = "Can have a list of trip items"
        };
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 50,
            Name = "Can have a list of trip bags"
        };  
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 60,
            Name = "Can add a dictionary/trip item over a limit"
        };  
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 70,
            Name = "Can add a dictionary/trip traveler over a limit"
        };  
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 80,
            Name = "Can send extended prompts to the AI"
        };  
        AddRuleWithValidation(rule);

        rule = new AccessRule()
        {
            Id = 90,
            Name = "Can send prompts to the AI over a limit"
        };  
        AddRuleWithValidation(rule);
    }

    public AccessRule this[int index]
    {
        get => _rules[index];
    }

    public void SetRuleGrant(int index, bool granted)
    {
        if (index < 0 || index >= _rules.Count)
            throw new IndexOutOfRangeException(nameof(index));
        
        _rules[index].Granted = granted;
    }

    public void SetRuleValue(int index, int value)
    {
        if (index < 0 || index >= _rules.Count)
            throw new IndexOutOfRangeException(nameof(index));
        
        _rules[index].Value = value;
    }


}