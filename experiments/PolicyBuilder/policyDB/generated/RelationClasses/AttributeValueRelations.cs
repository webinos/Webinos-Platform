///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: AttributeValue. </summary>
	public partial class AttributeValueRelations
	{
		/// <summary>CTor</summary>
		public AttributeValueRelations()
		{
		}

		/// <summary>Gets all relations of the AttributeValueEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();


			toReturn.Add(this.AttributeEntityUsingAttributeId);
			toReturn.Add(this.DecisionNodeEntityUsingAttributeMatchId);
			return toReturn;
		}

		#region Class Property Declarations



		/// <summary>Returns a new IEntityRelation object, between AttributeValueEntity and AttributeEntity over the m:1 relation they have, using the relation between the fields:
		/// AttributeValue.AttributeId - Attribute.Id
		/// </summary>
		public virtual IEntityRelation AttributeEntityUsingAttributeId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Attribute", false);
				relation.AddEntityFieldPair(AttributeFields.Id, AttributeValueFields.AttributeId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeValueEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between AttributeValueEntity and DecisionNodeEntity over the m:1 relation they have, using the relation between the fields:
		/// AttributeValue.AttributeMatchId - DecisionNode.Id
		/// </summary>
		public virtual IEntityRelation DecisionNodeEntityUsingAttributeMatchId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "AttributeMatch", false);
				relation.AddEntityFieldPair(DecisionNodeFields.Id, AttributeValueFields.AttributeMatchId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("DecisionNodeEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("AttributeValueEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
